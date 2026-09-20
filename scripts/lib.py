import re
import sys
from datetime import date, datetime

# == Frontmatter ==

_BLOCK = re.compile(r"^---\r?\n(.*?)\r?\n---(\r?\n|$)", re.DOTALL)
_PAIR = re.compile(r"^([a-z_][a-z0-9_]*):[ \t]*(.*)$")


def parse_frontmatter(md):
    """Parse a frontmatter block, returning `(data, error)` with exactly one set.

    Deliberately supports only the YAML forms this repo actually uses: plain
    scalars, double-quoted scalars, folded `>-` blocks and inline `[a, b]` lists.
    Anything else is reported rather than guessed at, so the linter can never
    disagree silently with the `yaml` parser the site build uses.
    """
    m = _BLOCK.match(md)
    if not m:
        return None, "no frontmatter block"

    lines = re.split(r"\r?\n", m.group(1))
    data = {}

    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip() == "" or line.lstrip().startswith("#"):
            i += 1
            continue

        kv = _PAIR.match(line)
        if not kv:
            return None, f'frontmatter line {i + 1}: not a "key: value" pair'

        key, rest = kv.group(1), kv.group(2)
        if key in data:
            return None, f'duplicate frontmatter key "{key}"'

        if rest in (">-", ">"):
            block = []
            while i + 1 < len(lines) and re.match(r"^\s+\S", lines[i + 1]):
                i += 1
                block.append(lines[i].strip())
            if not block:
                return None, f'"{key}": folded block is empty'
            data[key] = " ".join(block)
        elif rest.startswith("["):
            if not rest.endswith("]"):
                return None, f'"{key}": unterminated inline list'
            data[key] = [
                v
                for v in (
                    re.sub(r"^[\"']|[\"']$", "", part.strip())
                    for part in rest[1:-1].split(",")
                )
                if v != ""
            ]
        elif rest.startswith('"'):
            if not rest.endswith('"') or len(rest) < 2:
                return None, f'"{key}": unterminated double-quoted string'
            data[key] = rest[1:-1].replace('\\"', '"')
        elif rest.startswith("'") or rest == "" or rest == "|":
            return None, f'"{key}": unsupported YAML form, use a plain, "quoted" or >- value'
        else:
            data[key] = rest

        i += 1

    return data, None


# == Rules ==

FIELDS = ["name", "description", "tags", "updated_at"]

# Claude Code's own limits on a skill's frontmatter
MAX_NAME = 64
MAX_DESCRIPTION = 1024


def check_fields(data, report, today):
    for key in FIELDS:
        if key not in data:
            report.err(f'missing frontmatter key "{key}"')
    for key in data:
        if key not in FIELDS:
            report.err(f'unknown frontmatter key "{key}"')

    name = data.get("name")
    if isinstance(name, str):
        if name.strip() == "":
            report.err('"name" is empty')
        elif len(name) > MAX_NAME:
            report.err(f'"name" is {len(name)} chars, limit is {MAX_NAME}')

    description = data.get("description")
    if isinstance(description, str):
        if description.strip() == "":
            report.err('"description" is empty')
        elif len(description) > MAX_DESCRIPTION:
            report.err(
                f'"description" is {len(description)} chars, limit is {MAX_DESCRIPTION}'
            )

    if "tags" in data:
        tags = data["tags"]
        if not isinstance(tags, list):
            report.err('"tags" is not a list')
        elif not tags:
            report.err('"tags" is empty')
        else:
            for tag in tags:
                if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", tag):
                    report.err(f'tag "{tag}" is not lowercase kebab-case')
            seen = set()
            for tag in tags:
                if tag in seen:
                    report.err(f'duplicate tag "{tag}"')
                seen.add(tag)

    updated_at = data.get("updated_at")
    if isinstance(updated_at, str):
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", updated_at):
            report.err(f'"updated_at" is "{updated_at}", want YYYY-MM-DD')
        elif not _is_real_date(updated_at):
            report.err(f'"updated_at" is not a real date: {updated_at}')
        elif updated_at > today:
            report.err(f'"updated_at" is in the future: {updated_at}')
    elif "updated_at" in data:
        report.err('"updated_at" is not a string, quote it or use YYYY-MM-DD')


def _is_real_date(s):
    try:
        datetime.strptime(s, "%Y-%m-%d")  # noqa: DTZ007
    except ValueError:
        return False
    return True


# == Punctuation ==

# Mirrors the Characters section of instructions/text-style.md, written as
# escapes so this file stays ASCII while naming what it bans
BANNED = [
    ("—", 'em dash, use a spaced hyphen " - "'),
    ("–", 'en dash, use a plain hyphen "-"'),
    ("“", 'curly quote, use a straight "'),
    ("”", 'curly quote, use a straight "'),
    ("‘", "curly quote, use a straight '"),
    ("’", "curly quote, use a straight '"),
    ("…", 'ellipsis character, use three periods "..."'),
    (" ", "non-breaking space, use an ordinary space"),
]

# These two document the banned characters, so they quote them on purpose
PUNCTUATION_ALLOWLIST = [
    "skills/humanize/",
    "instructions/text-style.md",
]


def check_punctuation(path, text, report):
    if any(path.startswith(p) for p in PUNCTUATION_ALLOWLIST):
        return
    for i, line in enumerate(re.split(r"\r?\n", text)):
        for ch, why in BANNED:
            if ch in line:
                report.err(f"line {i + 1}: {why}")


# == kasetto.yaml ==


def kasetto_mcp_names(root):
    """Return the server names listed under the top-level `mcps:` key.

    Only those names are needed, so this reads the block directly rather than
    pulling in a YAML parser.
    """
    names = set()
    inside = False
    for line in (root / "kasetto.yaml").read_text(encoding="utf-8").splitlines():
        if re.match(r"^[a-z_]+:", line):
            inside = line.startswith("mcps:")
            continue
        if not inside:
            continue
        m = re.match(r"^\s+-\s+([a-z0-9][a-z0-9-]*)\s*$", line)
        if m:
            names.add(m.group(1))
    return names


def kasetto_external_skills(root):
    """Return (source_label, skill) for every explicitly named external skill.

    A `"*"` entry names no skills, and the local source is this repository, so
    neither can be checked against the site's tag tables.
    """
    out = []
    inside = False
    source = None
    for line in (root / "kasetto.yaml").read_text(encoding="utf-8").splitlines():
        if re.match(r"^[a-z_]+:", line):
            inside = line.startswith("skills:")
            source = None
            continue
        if not inside:
            continue
        m = re.match(r"^\s+-?\s*source:\s*(\S+)", line)
        if m:
            source = m.group(1).replace("https://github.com/", "")
            continue
        m = re.match(r"^\s+-\s+([a-z0-9][a-z0-9-]*)\s*$", line)
        if m and source and source != "pivoshenko/pivoshenko.ai":
            out.append((source, m.group(1)))
    return out


def site_tag_keys(root, table):
    """Keys of a lookup table in site/lib/external-tags.ts.

    The site is TypeScript and these linters are stdlib-only, so the table is
    read as text rather than executed - the same reason the frontmatter and
    kasetto parsers here are hand-rolled.
    """
    text = (root / "site/lib/external-tags.ts").read_text(encoding="utf-8")
    start = text.index(table)
    end = text.index("\n}", start)
    return {
        m.group(1)
        for m in re.finditer(
            r"^\s+'?([A-Za-z0-9/._-]+)'?:\s*\[", text[start:end], re.MULTILINE
        )
    }


# == Reporting ==


class Report:
    def __init__(self, label):
        self.label = label
        self.errors = []
        self.warnings = []
        self._file = None

    def file(self, path):
        self._file = path

    def err(self, msg):
        self.errors.append(f"{self._file}: {msg}")

    def warn(self, msg):
        self.warnings.append(f"{self._file}: {msg}")

    def finish(self, count, unit):
        for w in self.warnings:
            print(f"  warn  {w}")
        for e in self.errors:
            print(f"  error {e}")
        summary = (
            f"{self.label}: {count} {unit}, "
            f"{len(self.errors)} error(s), {len(self.warnings)} warning(s)"
        )
        print(f"FAIL  {summary}" if self.errors else f"ok    {summary}")
        sys.exit(1 if self.errors else 0)


TODAY = date.today().isoformat()  # noqa: DTZ011
