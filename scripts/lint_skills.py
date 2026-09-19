#!/usr/bin/env python3
import re
from pathlib import Path

from lib import TODAY, Report, check_fields, check_punctuation, parse_frontmatter

ROOT = Path.cwd()
report = Report("skills")
count = 0


def markdown_files(directory):
    out = []
    for entry in sorted(directory.iterdir(), key=lambda p: p.name):
        if entry.is_dir():
            out.extend(markdown_files(entry))
        elif entry.name.endswith(".md"):
            out.append(entry)
    return out


for base in ["skills", "archive/skills"]:
    directory = ROOT / base
    if not directory.exists():
        continue
    live = base == "skills"

    for entry in sorted(p.name for p in directory.iterdir()):
        if entry.startswith("."):
            continue
        path = directory / entry

        if not path.is_dir():
            report.file(f"{base}/{entry}")
            report.err("stray file, every entry must be a skill directory")
            continue

        count += 1
        skill_file = path / "SKILL.md"
        report.file(f"{base}/{entry}/SKILL.md")

        if not skill_file.exists():
            report.err("no SKILL.md, this breaks the site build")
            continue
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", entry):
            report.err(f'directory "{entry}" is not lowercase kebab-case')

        data, error = parse_frontmatter(skill_file.read_text(encoding="utf-8"))
        if error:
            report.err(error)
            continue

        check_fields(data, report, TODAY)
        name = data.get("name")
        if isinstance(name, str) and name != entry:
            report.err(f'"name" is "{name}" but the directory is "{entry}"')

        # Live prose only: archive is frozen, so style drift there is not actionable
        if live:
            for file in markdown_files(path):
                rel = str(file.relative_to(ROOT))
                report.file(rel)
                check_punctuation(rel, file.read_text(encoding="utf-8"), report)

report.finish(count, "skills")
