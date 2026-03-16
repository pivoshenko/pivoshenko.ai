#!/usr/bin/env python3

"""Bootstrap skills from skills.config.yaml using local paths or GitHub tarballs."""

from __future__ import annotations

import io
import os
import re
import sys
import json
import shutil
import typing
import hashlib
import pathlib
import tarfile
import argparse
import datetime as dt
import dataclasses
import urllib.error
import urllib.request


AI_HOME = pathlib.Path.home() / ".ai" / "bootstrap"
STATE_FILE = AI_HOME / "state.json"
LOG_FILE = AI_HOME / "bootstrap.log"
RUNS_DIR = AI_HOME / "runs"

INDENT_SKILLS_ITEM = 2
INDENT_SKILL_FIELD = 4
INDENT_SKILL_LIST_ITEM = 6
INDENT_SKILL_LIST_FIELD = 8

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
STATUS_COLORS = {
    "failed": TERMINAL_COLOR_RED,
    "installed": TERMINAL_COLOR_GREEN,
    "removed": TERMINAL_COLOR_RED,
    "updated": TERMINAL_COLOR_GREEN,
    "unchanged": TERMINAL_COLOR_YELLOW,
    "would_remove": TERMINAL_COLOR_RED,
    "would_install": TERMINAL_COLOR_GREEN,
    "would_update": TERMINAL_COLOR_GREEN,
}

DEFAULT_TIMEOUT_SECONDS = 30
DOWNLOAD_TIMEOUT_SECONDS = 120
HASH_CHUNK_BYTES = 1024 * 1024
RUNS_TO_KEEP = 5
MIN_ARCHIVE_PATH_PARTS = 2


@dataclasses.dataclass(frozen=True, slots=True)
class SkillTarget:
    name: str
    path: str | None = None


type RequestedSkills = str | list[SkillTarget]
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

    def archive_url(self) -> str:
        return (
            f"https://codeload.github.com/{self.owner}/{self.repo}/tar.gz/refs/heads/{self.branch}"
        )


@dataclasses.dataclass(slots=True)
class LocalSource:
    source_raw: str
    root_dir: pathlib.Path
    available: dict[str, pathlib.Path]
    revision: str = "local"

    def selected_skills(self, requested: RequestedSkills) -> list[SkillTarget]:
        return select_skill_targets(self.available.keys(), requested)

    def stage_skill(
        self,
        skill: SkillTarget,
        _stage_dir: pathlib.Path,
    ) -> pathlib.Path | None:
        if skill.path:
            return resolve_skill_target_path(self.root_dir, skill)
        return self.available.get(skill.name)


@dataclasses.dataclass(slots=True)
class RemoteSource:
    source_raw: str
    repo: GitHubRepo
    root_dir: pathlib.Path
    available: dict[str, pathlib.Path]

    @property
    def revision(self) -> str:
        return f"branch:{self.repo.branch}"

    def selected_skills(self, requested: RequestedSkills) -> list[SkillTarget]:
        return select_skill_targets(self.available.keys(), requested)

    def stage_skill(self, skill: SkillTarget, _stage_dir: pathlib.Path) -> pathlib.Path | None:
        if skill.path:
            return resolve_skill_target_path(self.root_dir, skill)
        return self.available.get(skill.name)


@dataclasses.dataclass(slots=True)
class Counters:
    installed: int = 0
    removed: int = 0
    updated: int = 0
    unchanged: int = 0
    failed: int = 0

    def add_status(self, status: str) -> None:
        if status == "installed":
            self.installed += 1
            return
        if status in {"removed", "would_remove"}:
            self.removed += 1
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
    desired_destinations: set[pathlib.Path]
    desired_state_keys: set[str]


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
            print(f"{terminal_prefix(level)} {colorize_terminal_message(message)}")


def utc_now() -> str:
    return dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat()


def short_hash(text: str, size: int = 12) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:size]


def empty_state() -> JsonDict:
    return {"version": 1, "skills": {}, "last_run": None}


def skill_state_key(source_raw: str, skill_name: str) -> str:
    return f"{source_raw}::{skill_name}"


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


def colorize_terminal_message(message: str) -> str:
    if message.startswith("Summary: "):
        return colorize_summary_message(message)

    head, separator, tail = message.rpartition(": ")
    status = tail if separator else message
    color = STATUS_COLORS.get(status)
    if color is None:
        return message
    colored_status = f"{color}{status}{TERMINAL_COLOR_RESET}"
    if not separator:
        return colored_status
    return f"{head}{separator}{colored_status}"


def colorize_summary_message(message: str) -> str:
    prefix = "Summary: "
    colored_parts: list[str] = []

    for part in message.removeprefix(prefix).split(", "):
        name, separator, value = part.partition("=")
        color = STATUS_COLORS.get(name)
        if color is None or not separator:
            colored_parts.append(part)
            continue
        colored_parts.append(f"{name}={color}{value}{TERMINAL_COLOR_RESET}")

    return prefix + ", ".join(colored_parts)


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


def parse_skill_target(
    lines: list[tuple[int, str]],
    start: int,
) -> tuple[int, SkillTarget]:
    indent, text = lines[start]
    if indent != INDENT_SKILL_LIST_ITEM or not text.startswith("- "):
        msg = f"Expected '- <skill-name>' under skills, got: {text}"
        raise ValueError(msg)

    payload = text[2:].strip()
    if ":" not in payload:
        return start + 1, SkillTarget(name=parse_scalar(payload))

    entry: dict[str, str] = {}
    key, value = split_key_value(payload)
    entry[key] = parse_scalar(value)

    index = start + 1
    while index < len(lines):
        child_indent, child_text = lines[index]
        if child_indent <= INDENT_SKILL_LIST_ITEM:
            break
        if child_indent != INDENT_SKILL_LIST_FIELD:
            msg = f"Unexpected indentation in skill item: {child_text}"
            raise ValueError(msg)
        key, value = split_key_value(child_text)
        entry[key] = parse_scalar(value)
        index += 1

    name = entry.get("name", "").strip()
    path = entry.get("path", "").strip() or None
    if not name:
        msg = "Skill item mappings must include `name`."
        raise ValueError(msg)

    return index, SkillTarget(name=name, path=path)


def parse_skill_list(
    lines: list[tuple[int, str]],
    start: int,
) -> tuple[int, list[SkillTarget]]:
    selected: list[SkillTarget] = []
    index = start

    while index < len(lines):
        list_indent, _list_text = lines[index]
        if list_indent <= INDENT_SKILL_FIELD:
            break
        index, target = parse_skill_target(lines, index)
        selected.append(target)

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

        index, selected = parse_skill_list(lines, index + 1)
        entry["skills"] = selected

    source = str(entry.get("source", "")).strip()
    requested = entry.get("skills")
    branch_raw = str(entry.get("branch", "")).strip() or None

    if not source or requested is None:
        msg = "Each source entry must include `source` and `skills`."
        raise ValueError(msg)
    if requested != "*" and not isinstance(requested, list):
        msg = "`skills` must be '*' or a list of skill names or mappings."
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
        isinstance(requested, list) and any(item.name.strip() == "*" for item in requested)
    )


def requested_targets(requested: RequestedSkills) -> list[SkillTarget]:
    if requested == "*":
        return []
    if isinstance(requested, list):
        return requested
    return [SkillTarget(name=str(requested))]


def select_skill_targets(
    available_names: typing.Iterable[str],
    requested: RequestedSkills,
) -> list[SkillTarget]:
    if is_wildcard_requested(requested):
        return [SkillTarget(name=name) for name in sorted(set(available_names))]
    return requested_targets(requested)


def resolve_skill_target_path(source_root: pathlib.Path, skill: SkillTarget) -> pathlib.Path | None:
    if not skill.path:
        return None

    path_value = pathlib.Path(skill.path)
    if path_value.is_absolute() or any(part in {"", ".", ".."} for part in path_value.parts):
        msg = f"Invalid skill path for '{skill.name}': {skill.path}"
        raise ValueError(msg)

    base_path = source_root / path_value
    candidates = [
        base_path / skill.name,
        base_path,
    ]

    for candidate in candidates:
        if candidate.is_dir() and (candidate / "SKILL.md").is_file():
            return candidate

    return None


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


def archive_member_path(name: str) -> pathlib.PurePosixPath | None:
    parts = pathlib.PurePosixPath(name).parts
    if len(parts) < MIN_ARCHIVE_PATH_PARTS:
        return None

    relative_parts = parts[1:]
    if any(part in {"", ".", ".."} for part in relative_parts):
        msg = f"Unsafe archive member path: {name}"
        raise ValueError(msg)

    return pathlib.PurePosixPath(*relative_parts)


def extract_repo_archive(archive_bytes: bytes, target_dir: pathlib.Path) -> pathlib.Path:
    if target_dir.exists():
        shutil.rmtree(target_dir)
    target_dir.mkdir(parents=True, exist_ok=True)
    resolved_root = target_dir.resolve()

    with tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r:gz") as archive:
        wrote_files = False

        for member in archive.getmembers():
            relative_path = archive_member_path(member.name)
            if relative_path is None:
                continue

            destination_path = target_dir / pathlib.Path(relative_path)
            resolved_target = destination_path.resolve()
            if resolved_root not in resolved_target.parents and resolved_target != resolved_root:
                msg = f"Archive extraction escaped target dir: {member.name}"
                raise ValueError(msg)

            if member.isdir():
                destination_path.mkdir(parents=True, exist_ok=True)
                continue

            if not member.isfile():
                continue

            extracted = archive.extractfile(member)
            if extracted is None:
                msg = f"Unable to read archive member: {member.name}"
                raise ValueError(msg)

            destination_path.parent.mkdir(parents=True, exist_ok=True)
            destination_path.write_bytes(extracted.read())
            destination_path.chmod(member.mode & 0o777)
            wrote_files = True

    if not wrote_files:
        msg = "Downloaded archive did not contain any files"
        raise ValueError(msg)

    return target_dir


def download_repo_archive(github_repo: GitHubRepo, target_dir: pathlib.Path) -> pathlib.Path:
    archive_bytes = http_get_bytes(github_repo.archive_url(), timeout=DOWNLOAD_TIMEOUT_SECONDS)
    return extract_repo_archive(archive_bytes, target_dir)


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
    state_key = skill_state_key(request.source_raw, request.skill_name)
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
    remote_stage_dir: pathlib.Path,
) -> SourceHandle:
    if not is_remote_source(spec.source):
        source_path = resolve_path(spec.source, config_dir)
        if not source_path.exists():
            msg = f"local source does not exist: {source_path}"
            raise ValueError(msg)
        if not source_path.is_dir():
            msg = "local source exists but is not a directory"
            raise ValueError(msg)
        return LocalSource(
            source_raw=spec.source,
            root_dir=source_path,
            available=discover_local_skills(source_path),
        )

    repo_ref = parse_github_repo(spec.source)
    if repo_ref is None:
        msg = "unsupported source; use a local path or GitHub HTTPS URL"
        raise ValueError(msg)

    owner, repo = repo_ref
    branch = resolve_github_branch(owner, repo, spec.branch)
    github_repo = GitHubRepo(owner=owner, repo=repo, branch=branch)
    extracted_repo_dir = download_repo_archive(github_repo, remote_stage_dir)
    available = discover_local_skills(extracted_repo_dir)
    return RemoteSource(
        source_raw=spec.source,
        repo=github_repo,
        root_dir=extracted_repo_dir,
        available=available,
    )


def append_action(actions: list[JsonDict], **payload: object) -> None:
    actions.append(dict(payload))


def path_within(root: pathlib.Path, target: pathlib.Path) -> bool:
    resolved_root = root.resolve()
    resolved_target = target.resolve()
    return resolved_target == resolved_root or resolved_root in resolved_target.parents


def remove_path(path: pathlib.Path) -> None:
    if path.is_dir():
        shutil.rmtree(path)
        return
    if path.exists():
        path.unlink()


def remove_stale_skills(context: RunContext) -> None:
    for state_key, entry in list(context.state["skills"].items()):
        if state_key in context.desired_state_keys:
            continue

        skill_name = str(entry.get("skill", "unknown-skill"))
        destination_raw = str(entry.get("destination", "")).strip()
        destination_path = pathlib.Path(destination_raw).expanduser()
        if not destination_raw:
            destination_path = context.destination / skill_name

        if destination_path in context.desired_destinations:
            if not context.dry_run:
                context.state["skills"].pop(state_key, None)
            continue

        if not path_within(context.destination, destination_path):
            context.logger.log(
                "WARN",
                f"{skill_name}: skipped stale state outside destination",
            )
            continue

        status = "would_remove" if context.dry_run else "removed"
        if not context.dry_run:
            remove_path(destination_path)
            context.state["skills"].pop(state_key, None)

        context.counters.add_status(status)
        context.logger.log("INFO", f"{skill_name}: {status}")
        append_action(
            context.actions,
            destination=str(destination_path),
            skill=skill_name,
            source=str(entry.get("source", "")),
            status=status,
        )


def process_source(
    spec: SourceSpec,
    index: int,
    context: RunContext,
) -> None:
    context.logger.log("INFO", f"Sync source {spec.source}")
    stage_root = context.run_dir / f"source-{index:02d}-{short_hash(spec.source, 10)}"

    try:
        source_handle = create_source_handle(
            spec,
            context.config_dir,
            stage_root / "repo",
        )
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

    for skill in selected_skills:
        context.desired_state_keys.add(skill_state_key(spec.source, skill.name))
        context.desired_destinations.add(context.destination / skill.name)

        try:
            source_dir = source_handle.stage_skill(skill, stage_root / skill.name)
        except (urllib.error.URLError, ValueError) as exc:
            context.counters.failed += 1
            context.logger.log("ERROR", f"{spec.source}: {exc}")
            append_action(
                context.actions,
                source=spec.source,
                skill=skill.name,
                status="download_failed",
                error=str(exc),
            )
            continue

        if source_dir is None:
            context.counters.failed += 1
            context.logger.log("ERROR", f"{spec.source}: skill '{skill.name}' was not found")
            append_action(
                context.actions,
                source=spec.source,
                skill=skill.name,
                path=skill.path,
                status="not_found",
            )
            continue

        request = SyncRequest(
            source_raw=spec.source,
            skill_name=skill.name,
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

        context.logger.log("INFO", f"{skill.name}: {status}")
        append_action(
            context.actions,
            source=spec.source,
            skill=skill.name,
            path=skill.path,
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
        desired_destinations=set(),
        desired_state_keys=set(),
    )

    for index, spec in enumerate(config.sources, start=1):
        process_source(spec, index, context)

    remove_stale_skills(context)

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
        f"removed={counters.removed}, "
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
        "configpath",
        nargs="?",
        default="skills.config.yaml",
        help="Path to skills config YAML (default: skills.config.yaml)",
    )
    parser.add_argument(
        "--config",
        dest="configpath_flag",
        help="Deprecated alias for configpath",
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
    args = parser.parse_args()
    if args.configpath_flag:
        args.configpath = args.configpath_flag
    return args


def main() -> int:
    args = parse_args()
    config_path = pathlib.Path(args.configpath).expanduser().resolve()
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
