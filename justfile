default:
    @just --list

install:
    cd site && pnpm install

format:
    cd site && pnpm format

lint: lint-skills lint-mcps lint-instructions lint-next

lint-skills:
    python3 scripts/lint_skills.py

lint-mcps:
    python3 scripts/lint_mcps.py

lint-instructions:
    python3 scripts/lint_instructions.py

lint-next:
    cd site && pnpm lint
    cd site && pnpm typecheck

test:
    @[ -f .no-tests ] && echo "skipping (.no-tests sentinel)" || { echo "no test command, add tests or restore .no-tests" >&2; exit 1; }

check: lint test build

update:
    cd site && pnpm update

build:
    cd site && pnpm build

run-dev-server:
    cd site && pnpm dev

run-prod-server:
    cd site && pnpm build
    cd site && pnpm start
