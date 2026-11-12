default:
    @just --list

lint: lint-skills lint-mcps lint-instructions

lint-skills:
    python3 scripts/lint_skills.py

lint-mcps:
    python3 scripts/lint_mcps.py

lint-instructions:
    python3 scripts/lint_instructions.py

test:
    @[ -f .no-tests ] && echo "skipping (.no-tests sentinel)" || { echo "no test command, add tests or restore .no-tests" >&2; exit 1; }

check: lint test
