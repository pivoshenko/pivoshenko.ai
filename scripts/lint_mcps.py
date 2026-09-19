#!/usr/bin/env python3
import json
import re
from pathlib import Path

from lib import Report, kasetto_mcp_names

ROOT = Path.cwd()
MCPS = ROOT / "mcps"
report = Report("mcps")
configured = kasetto_mcp_names(ROOT)
count = 0

# Shapes that mean a real credential got committed instead of a placeholder
SECRETS = [
    (r"ghp_[A-Za-z0-9]{16,}", "GitHub personal access token"),
    (r"github_pat_[A-Za-z0-9_]{20,}", "GitHub fine-grained token"),
    (r"\bsk-[A-Za-z0-9-]{20,}", "API secret key"),
    (r"\bxox[abposr]-[A-Za-z0-9-]{10,}", "Slack token"),
    (r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.", "JWT"),
]

for entry in sorted(p.name for p in MCPS.iterdir()):
    if entry.startswith("."):
        continue
    report.file(f"mcps/{entry}")

    if not entry.endswith(".json"):
        report.err("stray file, every entry must be a .json server definition")
        continue

    count += 1
    stem = entry[: -len(".json")]
    raw = (MCPS / entry).read_text(encoding="utf-8")

    try:
        doc = json.loads(raw)
    except json.JSONDecodeError as e:
        report.err(f"invalid JSON: {e}")
        continue

    if not isinstance(doc, dict):
        report.err('top level is not an object, want a bare {"mcpServers": ...}')
        continue

    top = list(doc)
    if top != ["mcpServers"]:
        report.err(f'top level is {{{", ".join(top)}}}, want a bare {{"mcpServers": ...}}')
        continue

    servers = doc["mcpServers"] if isinstance(doc["mcpServers"], dict) else {}
    names = list(servers)
    if len(names) != 1:
        report.err(f"{len(names)} servers defined, want exactly one per file")
    elif names[0] != stem:
        report.err(f'server is named "{names[0]}" but the file is "{entry}"')

    for name, server in servers.items():
        url = server.get("url") if isinstance(server, dict) else None
        command = server.get("command") if isinstance(server, dict) else None
        if not url and not command:
            report.err(f'server "{name}" has neither "url" nor "command"')
        if url and not url.startswith("https://"):
            report.err(f'server "{name}" url is not https')

    for pattern, what in SECRETS:
        if re.search(pattern, raw):
            report.err(f"literal {what} committed, use a ${{kst_*}} placeholder")
    for placeholder in re.findall(r"\$\{([^}]*)\}", raw):
        if not re.fullmatch(r"kst_[a-z0-9_]+", placeholder):
            report.err(f'placeholder "${{{placeholder}}}" is not a Kasetto ${{kst_*}} reference')

    if stem not in configured:
        report.warn("not listed in kasetto.yaml, the site shows it but it is never synced")

for name in configured:
    if not (MCPS / f"{name}.json").exists():
        report.file("kasetto.yaml")
        report.err(f'names mcp "{name}" but mcps/{name}.json does not exist')

report.finish(count, "mcps")
