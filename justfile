format:
    pnpm -C site format

check:
    pnpm -C site check

lint:
    pnpm -C site check
    pnpm -C site build

dev:
    pnpm -C site dev

start:
    pnpm -C site build
    pnpm -C site start

install:
    pnpm -C site install

update:
    pnpm -C site update
