default:
    @just --list

install:
    pnpm -C site install

format:
    pnpm -C site check

lint:
    pnpm -C site lint

test:
    @[ -f .no-tests ] && echo "skipping (.no-tests sentinel)" || { echo "no test command, add tests or restore .no-tests" >&2; exit 1; }

check: lint test build

update:
    pnpm -C site update

build:
    pnpm -C site build

run-dev-server:
    pnpm -C site dev

run-prod-server:
    pnpm -C site build
    pnpm -C site start
