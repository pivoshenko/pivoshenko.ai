#!/usr/bin/env python3

"""
Bootstrap skills from skills.config.yaml using local paths or raw GitHub downloads.
"""

from __future__ import annotations

import os
import re
import sys
import json
import shutil
import typing
import hashlib
import pathlib
import argparse
import datetime as dt
import dataclasses
import urllib.error
import urllib.parse
import urllib.request


AI_HOME = pathlib.Path.home() / ".ai" / "bootstrap"
STATE_FILE = AI_HOME / "state.json"
LOG_FILE = AI_HOME / "bootstrap.log"
RUNS_DIR = AI_HOME / "runs"

INDENT_SKILLS_ITEM = 2
INDENT_SKILL_FIELD = 4
INDENT_SKILL_LIST_ITEM = 6

BANNER_LINES = [
    "           ░██                                 ░██                              ░██                                 ░██",  # noqa: E501
    "                                               ░██                              ░██                                    ",  # noqa: E501
    "░████████  ░██░██    ░██  ░███████   ░███████  ░████████   ░███████  ░████████  ░██    ░██ ░███████       ░██████   ░██",  # noqa: E501
    "░██    ░██ ░██░██    ░██ ░██    ░██ ░██        ░██    ░██ ░██    ░██ ░██    ░██ ░██   ░██ ░██    ░██           ░██  ░██",  # noqa: E501
    "░██    ░██ ░██ ░██  ░██  ░██    ░██  ░███████  ░██    ░██ ░█████████ ░██    ░██ ░███████  ░██    ░██      ░███████  ░██",  # noqa: E501
    "░███   ░██ ░██  ░██░██   ░██    ░██        ░██ ░██    ░██ ░██        ░██    ░██ ░██   ░██ ░██    ░██     ░██   ░██  ░██",  # noqa: E501
    "░██░█████  ░██   ░███     ░███████   ░███████  ░██    ░██  ░███████  ░██    ░██ ░██    ░██ ░███████  ░██  ░█████░██ ░██",  # noqa: E501
    "░██                                                                                                                    ",  # noqa: E501
    "░██                                                                                                                    ",  # noqa: E501
    "                                                                                                                       ",  # noqa: E501
]

TERMINAL_COLOR_GREEN = "\x1b[32m"
TERMINAL_COLOR_YELLOW = "\x1b[33m"
TERMINAL_COLOR_RED = "\x1b[31m"
TERMINAL_COLOR_RESET = "\x1b[0m"

DEFAULT_TIMEOUT_SECONDS = 30
DOWNLOAD_TIMEOUT_SECONDS = 120
HASH_CHUNK_BYTES = 1024 * 1024
RUNS_TO_KEEP = 5

type RequestedSkills = str | list[str]
type JsonDict = dict[str, typing.Any]
type SourceHandle = "LocalSource | RemoteSource"


@dataclasses.dataclass(slots=True)
class SourceSpec:
    source: str
    skills: RequestedSkills
    branch: str | None = None


@dataclasses.dataclass(slots=True)
class Config:
    destination: str
    sources: list[SourceSpec]


@dataclasses.dataclass(frozen=True, slots=True)
class GitHubRepo:
    owner: str
    repo: str
    branch: str

    def tree_url(self, path: str = "") -> str:
        clean_path = path.strip("/")
        if clean_path:
            return f"https://github.com/{self.owner}/{self.repo}/tree/{self.branch}/{clean_path}"
        return f"https://github.com/{self.owner}/{self.repo}/tree/{self.branch}"

    def raw_url(self, path: str) -> str:
        clean_path = path.strip("/")
        return (
            f"https://raw.githubusercontent.com/{self.owner}/{self.repo}/{self.branch}/{clean_path}"
        )


@dataclasses.dataclass(slots=True)
class LocalSource:
    source_raw: str
    available: dict[str, pathlib.Path]
    revision: str = "local"

    def selected_skills(self, requested: RequestedSkills) -> list[str]:
        return select_skill_names(self.available.keys(), requested)

    def stage_skill(
        self,
        skill_name: str,
        _stage_dir: pathlib.Path,
    ) -> pathlib.Path | None:
        return self.available.get(skill_name)


@dataclasses.dataclass(slots=True)
class RemoteSource:
    source_raw: str
    repo: GitHubRepo
    available: dict[str, str]

    @property
    def revision(self) -> str:
        return f"branch:{self.repo.branch}"

    def selected_skills(self, requested: RequestedSkills) -> list[str]:
        return select_skill_names(self.available.keys(), requested)

    def stage_skill(self, skill_name: str, stage_dir: pathlib.Path) -> pathlib.Path | None:
        skill_root = self.available.get(skill_name)
        if skill_root is None:
            return None
        download_remote_skill(self.repo, skill_root, stage_dir)
        return stage_dir


@dataclasses.dataclass(slots=True)
class Counters:
    installed: int = 0
    updated: int = 0
    unchanged: int = 0
    failed: int = 0

    def add_status(self, status: str) -> None:
        if status == "installed":
            self.installed += 1
            return
        if status == "updated":
            self.updated += 1
            return
        if status == "unchanged":
            self.unchanged += 1


@dataclasses.dataclass(frozen=True, slots=True)
class SyncRequest:
    source_raw: str
    skill_name: str
    source_dir: pathlib.Path
    source_revision: str


@dataclasses.dataclass(slots=True)
class RunContext:
    config_dir: pathlib.Path
    destination: pathlib.Path
    state: JsonDict
    dry_run: bool
    run_dir: pathlib.Path
    logger: Logger
    actions: list[JsonDict]
    counters: Counters


class Logger:
    def __init__(self, path: pathlib.Path, *, verbose: bool = True) -> None:
        self.path = path
        self.verbose = verbose
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def log(self, level: str, message: str) -> None:
        line = f"[{utc_now()}] [{level}] {message}"
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(line + "\n")

        if self.verbose:
            print(f"{terminal_prefix(level)} {message}")


def utc_now() -> str:
    return dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat()


def short_hash(text: str, size: int = 12) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:size]


def empty_state() -> JsonDict:
    return {"version": 1, "skills": {}, "last_run": None}


def terminal_prefix(level: str) -> str:
    color = TERMINAL_COLOR_RESET
    match level.upper():
        case "INFO":
            color = TERMINAL_COLOR_GREEN
        case "WARN" | "WARNING":
            color = TERMINAL_COLOR_YELLOW
        case "ERROR":
            color = TERMINAL_COLOR_RED
    return f"{color}[bootstrap]{TERMINAL_COLOR_RESET}"


def print_banner() -> None:
    for line in BANNER_LINES:
        print(f"{TERMINAL_COLOR_GREEN}{line}{TERMINAL_COLOR_RESET}")


def parse_scalar(raw: str) -> str:
    value = raw.strip()
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def split_key_value(raw: str) -> tuple[str, str]:
    if ":" not in raw:
        msg = f"Expected key:value pair, got: {raw}"
        raise ValueError(msg)
    key, value = raw.split(":", 1)
    return key.strip(), value.strip()


def config_lines(config_path: pathlib.Path) -> list[tuple[int, str]]:
    lines: list[tuple[int, str]] = []
    for raw_line in config_path.read_text(encoding="utf-8").splitlines():
        clean_line = raw_line.split("#", 1)[0].rstrip()
        if not clean_line.strip():
            continue
        indent = len(clean_line) - len(clean_line.lstrip(" "))
        lines.append((indent, clean_line.strip()))
    return lines


def parse_skill_name_list(
    lines: list[tuple[int, str]],
    start: int,
) -> tuple[int, list[str]]:
    selected: list[str] = []
    index = start

    while index < len(lines):
        list_indent, list_text = lines[index]
        if list_indent <= INDENT_SKILL_FIELD:
            break
        if list_indent != INDENT_SKILL_LIST_ITEM or not list_text.startswith("- "):
            msg = f"Expected '- <skill-name>' under skills, got: {list_text}"
            raise ValueError(msg)
        selected.append(parse_scalar(list_text[2:]))
        index += 1

    return index, selected


def parse_source_block(lines: list[tuple[int, str]], start: int) -> tuple[int, SourceSpec]:
    indent, text = lines[start]
    if indent != INDENT_SKILLS_ITEM or not text.startswith("-"):
        msg = f"Expected source list item, got: {text}"
        raise ValueError(msg)

    entry: dict[str, RequestedSkills | str] = {}
    inline = text[1:].strip()
    if inline:
        key, value = split_key_value(inline)
        entry[key] = parse_scalar(value)

    index = start + 1
    while index < len(lines):
        child_indent, child_text = lines[index]
        if child_indent <= INDENT_SKILLS_ITEM:
            break
        if child_indent != INDENT_SKILL_FIELD:
            msg = f"Unexpected indentation in source block: {child_text}"
            raise ValueError(msg)

        key, value = split_key_value(child_text)
        if key != "skills" or value:
            entry[key] = parse_scalar(value)
            index += 1
            continue

        index, selected = parse_skill_name_list(lines, index + 1)
        entry["skills"] = selected

    source = str(entry.get("source", "")).strip()
    requested = entry.get("skills")
    branch_raw = str(entry.get("branch", "")).strip() or None

    if not source or requested is None:
        msg = "Each source entry must include `source` and `skills`."
        raise ValueError(msg)
    if requested != "*" and not isinstance(requested, list):
        msg = "`skills` must be '*' or a list of skill names."
        raise ValueError(msg)

    return index, SourceSpec(source=source, skills=requested, branch=branch_raw)


def load_config(config_path: pathlib.Path) -> Config:
    destination = ""
    sources: list[SourceSpec] = []
    lines = config_lines(config_path)

    index = 0
    while index < len(lines):
        indent, text = lines[index]
        if indent != 0:
            msg = f"Unexpected indentation at top level: {text}"
            raise ValueError(msg)

        if text.startswith("destination:"):
            _, value = split_key_value(text)
            destination = parse_scalar(value)
            index += 1
            continue

        if text == "skills:":
            index += 1
            while index < len(lines) and lines[index][0] > 0:
                index, source_spec = parse_source_block(lines, index)
                sources.append(source_spec)
            continue

        msg = f"Unknown top-level key: {text}"
        raise ValueError(msg)

    if not destination:
        msg = "Config must define `destination`."
        raise ValueError(msg)
    if not sources:
        msg = "Config must define a non-empty `skills` list."
        raise ValueError(msg)

    return Config(destination=destination, sources=sources)


def resolve_path(raw_path: str, base_dir: pathlib.Path) -> pathlib.Path:
    path = pathlib.Path(raw_path).expanduser()
    if not path.is_absolute():
        path = (base_dir / path).resolve()
    return path


def is_remote_source(source: str) -> bool:
    return "://" in source or source.startswith("git@")


def is_wildcard_requested(requested: RequestedSkills) -> bool:
    return requested == "*" or (
        isinstance(requested, list) and any(str(item).strip() == "*" for item in requested)
    )


def requested_names(requested: RequestedSkills) -> list[str]:
    if requested == "*":
        return []
    if isinstance(requested, list):
        return [str(item) for item in requested]
    return [str(requested)]


def select_skill_names(
    available_names: typing.Iterable[str],
    requested: RequestedSkills,
) -> list[str]:
    if is_wildcard_requested(requested):
        return sorted(set(available_names))
    return requested_names(requested)


def github_headers() -> dict[str, str]:
    headers = {
        "Accept": "text/html,application/octet-stream,*/*",
        "User-Agent": "bootstrap/1.0",
    }
    token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def http_get_bytes(url: str, timeout: int = DEFAULT_TIMEOUT_SECONDS) -> bytes:
    request = urllib.request.Request(url, headers=github_headers())  # noqa: S310
    with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310
        return response.read()


def http_get_text(url: str, timeout: int = DEFAULT_TIMEOUT_SECONDS) -> str:
    return http_get_bytes(url, timeout=timeout).decode("utf-8", errors="replace")


def parse_github_repo(source: str) -> tuple[str, str] | None:
    pattern = r"^https?://github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$"
    match = re.match(pattern, source)
    if match is None:
        return None
    return match.group(1), match.group(2)


def github_branch_exists(owner: str, repo: str, branch: str) -> bool:
    github_repo = GitHubRepo(owner=owner, repo=repo, branch=branch)
    try:
        _ = http_get_bytes(github_repo.tree_url())
    except urllib.error.URLError:
        return False
    return True


def resolve_github_branch(owner: str, repo: str, configured_branch: str | None) -> str:
    candidates: list[str] = []
    if configured_branch:
        candidates.append(configured_branch)
    candidates.extend(["main", "master"])

    for branch in candidates:
        if github_branch_exists(owner, repo, branch):
            return branch

    msg = f"Unable to resolve branch for https://github.com/{owner}/{repo}"
    raise ValueError(msg)


def list_github_dir(github_repo: GitHubRepo, dir_path: str) -> tuple[list[str], list[str]]:
    page = http_get_text(github_repo.tree_url(dir_path))
    prefix = dir_path.strip("/")
    prefix_with_separator = f"{prefix}/" if prefix else ""

    pattern = (
        rf'href="/{re.escape(github_repo.owner)}/{re.escape(github_repo.repo)}/'
        rf'(tree|blob)/{re.escape(github_repo.branch)}/([^"#?]+)"'
    )

    directories: set[str] = set()
    files: set[str] = set()

    for kind, raw_path in re.findall(pattern, page):
        decoded = urllib.parse.unquote(raw_path).strip("/")
        if prefix_with_separator:
            if not decoded.startswith(prefix_with_separator):
                continue
            decoded = decoded[len(prefix_with_separator) :]
        if not decoded or "/" in decoded:
            continue
        if kind == "tree":
            directories.add(decoded)
        else:
            files.add(decoded)

    return sorted(directories), sorted(files)


def raw_file_exists(github_repo: GitHubRepo, file_path: str) -> bool:
    try:
        _ = http_get_bytes(github_repo.raw_url(file_path))
    except urllib.error.URLError:
        return False
    return True


def resolve_skill_root(github_repo: GitHubRepo, skill_name: str) -> str | None:
    for root in (f"skills/{skill_name}", skill_name):
        if raw_file_exists(github_repo, f"{root}/SKILL.md"):
            return root
    return None


def discover_remote_skills(github_repo: GitHubRepo) -> dict[str, str]:
    discovered: dict[str, str] = {}

    for base_path in ("skills", ""):
        try:
            subdirectories, _ = list_github_dir(github_repo, base_path)
        except urllib.error.URLError:
            continue

        for subdirectory in subdirectories:
            if not base_path and subdirectory == "skills":
                continue
            root = f"{base_path}/{subdirectory}".strip("/")
            if raw_file_exists(github_repo, f"{root}/SKILL.md"):
                discovered[subdirectory] = root

    return discovered


def list_skill_files(github_repo: GitHubRepo, skill_root: str) -> list[str]:
    files: set[str] = set()
    queue = [skill_root.strip("/")]

    while queue:
        current = queue.pop()
        subdirectories, subfiles = list_github_dir(github_repo, current)
        files.update(f"{current}/{file_name}" for file_name in subfiles)
        queue.extend(f"{current}/{subdirectory}" for subdirectory in subdirectories)

    return sorted(files)


def discover_local_skills(source_dir: pathlib.Path) -> dict[str, pathlib.Path]:
    discovered: dict[str, pathlib.Path] = {}

    for root in (source_dir, source_dir / "skills"):
        if not root.is_dir():
            continue
        for entry in root.iterdir():
            if entry.is_dir() and (entry / "SKILL.md").is_file():
                discovered[entry.name] = entry

    return discovered


def hash_directory(directory: pathlib.Path) -> str:
    digest = hashlib.sha256()

    for file_path in sorted(path for path in directory.rglob("*") if path.is_file()):
        relative_path = file_path.relative_to(directory).as_posix()
        digest.update(relative_path.encode("utf-8"))
        digest.update(b"\0")
        with file_path.open("rb") as handle:
            while chunk := handle.read(HASH_CHUNK_BYTES):
                digest.update(chunk)
        digest.update(b"\0")

    return digest.hexdigest()


def download_remote_skill(
    github_repo: GitHubRepo,
    skill_root: str,
    target_dir: pathlib.Path,
) -> None:
    remote_files = list_skill_files(github_repo, skill_root)
    if not remote_files:
        msg = f"No files found for remote skill root: {skill_root}"
        raise ValueError(msg)

    normalized_root = skill_root.strip("/")
    root_prefix = f"{normalized_root}/"

    if target_dir.exists():
        shutil.rmtree(target_dir)
    target_dir.mkdir(parents=True, exist_ok=True)

    has_skill_markdown = False
    for remote_path in remote_files:
        relative_path = remote_path.removeprefix(root_prefix)
        has_skill_markdown |= relative_path == "SKILL.md"

        destination_file = target_dir / relative_path
        destination_file.parent.mkdir(parents=True, exist_ok=True)
        destination_file.write_bytes(
            http_get_bytes(github_repo.raw_url(remote_path), timeout=DOWNLOAD_TIMEOUT_SECONDS),
        )

    if not has_skill_markdown:
        msg = f"Missing SKILL.md in remote skill root: {skill_root}"
        raise ValueError(msg)


def copy_skill(source_dir: pathlib.Path, destination_dir: pathlib.Path) -> None:
    temporary_dir = (
        destination_dir.parent
        / f".{destination_dir.name}.tmp-{os.getpid()}-{short_hash(str(source_dir), 6)}"
    )
    if temporary_dir.exists():
        shutil.rmtree(temporary_dir)

    shutil.copytree(source_dir, temporary_dir)
    if destination_dir.exists():
        shutil.rmtree(destination_dir)
    temporary_dir.rename(destination_dir)


def sync_skill(
    request: SyncRequest,
    destination: pathlib.Path,
    state: JsonDict,
    *,
    dry_run: bool,
) -> tuple[str, str]:
    destination_dir = destination / request.skill_name
    skill_hash = hash_directory(request.source_dir)
    state_key = f"{request.source_raw}::{request.skill_name}"
    previous = state["skills"].get(state_key)

    if previous is not None and previous.get("hash") == skill_hash and destination_dir.exists():
        return "unchanged", skill_hash

    if dry_run:
        if previous is None:
            return "would_install", skill_hash
        return "would_update", skill_hash

    copy_skill(request.source_dir, destination_dir)
    state["skills"][state_key] = {
        "destination": str(destination_dir),
        "hash": skill_hash,
        "skill": request.skill_name,
        "source": request.source_raw,
        "source_revision": request.source_revision,
        "updated_at": utc_now(),
    }

    if previous is None:
        return "installed", skill_hash
    return "updated", skill_hash


def load_state(path: pathlib.Path) -> JsonDict:
    if not path.exists():
        return empty_state()
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return empty_state()
    if not isinstance(state, dict):
        return empty_state()
    state.setdefault("skills", {})
    state.setdefault("last_run", None)
    state.setdefault("version", 1)
    return state


def save_state(path: pathlib.Path, state: JsonDict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, sort_keys=True), encoding="utf-8")


def prune_old_runs(runs_dir: pathlib.Path, keep: int = RUNS_TO_KEEP) -> None:
    if not runs_dir.exists():
        return
    run_directories = sorted(path for path in runs_dir.iterdir() if path.is_dir())
    if len(run_directories) <= keep:
        return
    for stale_directory in run_directories[:-keep]:
        shutil.rmtree(stale_directory, ignore_errors=True)


def create_source_handle(
    spec: SourceSpec,
    config_dir: pathlib.Path,
    logger: Logger,
) -> SourceHandle:
    if not is_remote_source(spec.source):
        source_path = resolve_path(spec.source, config_dir)
        if not source_path.exists():
            msg = f"local source does not exist: {source_path}"
            raise ValueError(msg)
        if not source_path.is_dir():
            msg = "local source exists but is not a directory"
            raise ValueError(msg)
        return LocalSource(source_raw=spec.source, available=discover_local_skills(source_path))

    repo_ref = parse_github_repo(spec.source)
    if repo_ref is None:
        msg = "unsupported source; use a local path or GitHub HTTPS URL"
        raise ValueError(msg)

    owner, repo = repo_ref
    branch = resolve_github_branch(owner, repo, spec.branch)
    logger.log("INFO", f"{spec.source}: branch={branch}")
    github_repo = GitHubRepo(owner=owner, repo=repo, branch=branch)

    if is_wildcard_requested(spec.skills):
        available = discover_remote_skills(github_repo)
    else:
        available = {}
        for skill_name in requested_names(spec.skills):
            skill_root = resolve_skill_root(github_repo, skill_name)
            if skill_root is not None:
                available[skill_name] = skill_root

    return RemoteSource(source_raw=spec.source, repo=github_repo, available=available)


def append_action(actions: list[JsonDict], **payload: object) -> None:
    actions.append(dict(payload))


def process_source(
    spec: SourceSpec,
    index: int,
    context: RunContext,
) -> None:
    context.logger.log("INFO", f"Sync source {spec.source}")

    try:
        source_handle = create_source_handle(spec, context.config_dir, context.logger)
    except (urllib.error.URLError, ValueError) as exc:
        context.counters.failed += 1
        context.logger.log("ERROR", f"{spec.source}: {exc}")
        append_action(context.actions, source=spec.source, status="source_error", error=str(exc))
        return

    selected_skills = source_handle.selected_skills(spec.skills)
    if not selected_skills:
        context.logger.log("WARN", f"{spec.source}: no skills selected")
        append_action(context.actions, source=spec.source, status="empty_selection", skills=[])
        return

    stage_root = context.run_dir / f"source-{index:02d}-{short_hash(spec.source, 10)}"
    for skill_name in selected_skills:
        try:
            source_dir = source_handle.stage_skill(skill_name, stage_root / skill_name)
        except (urllib.error.URLError, ValueError) as exc:
            context.counters.failed += 1
            context.logger.log("ERROR", f"{spec.source}: {exc}")
            append_action(
                context.actions,
                source=spec.source,
                skill=skill_name,
                status="download_failed",
                error=str(exc),
            )
            continue

        if source_dir is None:
            context.counters.failed += 1
            context.logger.log("ERROR", f"{spec.source}: skill '{skill_name}' was not found")
            append_action(context.actions, source=spec.source, skill=skill_name, status="not_found")
            continue

        request = SyncRequest(
            source_raw=spec.source,
            skill_name=skill_name,
            source_dir=source_dir,
            source_revision=source_handle.revision,
        )
        status, skill_hash = sync_skill(
            request,
            context.destination,
            context.state,
            dry_run=context.dry_run,
        )
        context.counters.add_status(status)

        context.logger.log("INFO", f"{skill_name}: {status}")
        append_action(
            context.actions,
            source=spec.source,
            skill=skill_name,
            status=status,
            hash=skill_hash,
            source_revision=source_handle.revision,
        )


def bootstrap(
    config_path: pathlib.Path,
    *,
    dry_run: bool,
    logger: Logger,
) -> int:
    config = load_config(config_path)
    destination = resolve_path(config.destination, config_path.parent)
    destination.mkdir(parents=True, exist_ok=True)

    state = load_state(STATE_FILE)
    run_id = dt.datetime.now(dt.UTC).strftime("%Y%m%dT%H%M%SZ")
    run_dir = RUNS_DIR / f"run-{run_id}"
    run_dir.mkdir(parents=True, exist_ok=True)
    started_at = utc_now()

    actions: list[JsonDict] = []
    counters = Counters()
    context = RunContext(
        config_dir=config_path.parent,
        destination=destination,
        state=state,
        dry_run=dry_run,
        run_dir=run_dir,
        logger=logger,
        actions=actions,
        counters=counters,
    )

    for index, spec in enumerate(config.sources, start=1):
        process_source(spec, index, context)

    finished_at = utc_now()
    report = {
        "actions": actions,
        "config": str(config_path),
        "destination": str(destination),
        "dry_run": dry_run,
        "finished_at": finished_at,
        "run_id": run_id,
        "started_at": started_at,
        "summary": dataclasses.asdict(counters),
    }

    if not dry_run:
        state["last_run"] = finished_at
        save_state(STATE_FILE, state)

    report_path = run_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2, sort_keys=True), encoding="utf-8")

    logger.log(
        "INFO",
        "Summary: "
        f"installed={counters.installed}, "
        f"updated={counters.updated}, "
        f"unchanged={counters.unchanged}, "
        f"failed={counters.failed}",
    )
    logger.log("INFO", f"Run report: {report_path}")
    prune_old_runs(RUNS_DIR)

    if counters.failed > 0:
        return 1
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Install/update skills from skills.config.yaml")
    parser.add_argument(
        "--config",
        default="skills.config.yaml",
        help="Path to skills config YAML (default: skills.config.yaml)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Resolve and compare skills without writing destination or state",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Print fewer logs to stdout (still writes the log file)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    config_path = pathlib.Path(args.config).expanduser().resolve()
    if not config_path.exists():
        print(f"{terminal_prefix('ERROR')} Config file not found: {config_path}")
        return 2

    if not args.quiet:
        print_banner()

    AI_HOME.mkdir(parents=True, exist_ok=True)
    RUNS_DIR.mkdir(parents=True, exist_ok=True)

    logger = Logger(LOG_FILE, verbose=not args.quiet)
    logger.log("INFO", f"Starting bootstrap with config={config_path}")
    logger.log("INFO", f"State file={STATE_FILE}")

    try:
        return bootstrap(config_path, dry_run=args.dry_run, logger=logger)
    except Exception as exc:  # noqa: BLE001
        logger.log("ERROR", f"Bootstrap failed: {exc}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
