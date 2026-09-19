#!/usr/bin/env python3
import re
from pathlib import Path

from lib import TODAY, Report, check_fields, check_punctuation, parse_frontmatter

ROOT = Path.cwd()
report = Report("instructions")
count = 0


def slugify(name):
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", name.lower()))


for base in ["instructions", "archive/instructions"]:
    directory = ROOT / base
    if not directory.exists():
        continue
    live = base == "instructions"

    for entry in sorted(p.name for p in directory.iterdir()):
        if entry.startswith("."):
            continue
        rel = f"{base}/{entry}"
        report.file(rel)

        if not entry.endswith(".md"):
            report.err("stray file, every entry must be a .md instruction")
            continue

        count += 1
        slug = entry[: -len(".md")]
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
            report.err(f'filename "{entry}" is not lowercase kebab-case')

        text = (directory / entry).read_text(encoding="utf-8")
        data, error = parse_frontmatter(text)
        if error:
            report.err(error)
            continue

        check_fields(data, report, TODAY)

        # Conventions apply to live rules only: archive is frozen, so drift there
        # is a fact about the past rather than something to fix
        if live:
            name = data.get("name")
            if isinstance(name, str) and slugify(name) != slug:
                report.warn(f'"name" is "{name}" but the file is "{entry}"')
            description = data.get("description")
            if isinstance(description, str) and not re.match(r"^Guardrail\b", description):
                report.warn('"description" does not open with "Guardrail", the house convention')
            check_punctuation(rel, text, report)

report.finish(count, "instructions")
