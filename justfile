default:
    @just --list

install:
    pnpm -C site install

dev:
    pnpm -C site dev

format:
    pnpm -C site format

lint:
    pnpm -C site lint

audit:
    pnpm -C site audit

check:
    pnpm -C site check
    pnpm -C site build

build:
    pnpm -C site build

start:
    pnpm -C site build
    pnpm -C site start

update:
    pnpm -C site update

test:
    @[ -f .no-tests ] && echo "skipping (.no-tests sentinel)" || { echo "no test command — add tests or restore .no-tests" >&2; exit 1; }
