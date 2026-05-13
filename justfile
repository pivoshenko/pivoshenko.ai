format:
  pnpm -C site format

lint:
  pnpm -C site check
  pnpm -C site build

run:
  pnpm -C site dev

serve:
  pnpm -C site build
  pnpm -C site start

update:
  pnpm -C site update
