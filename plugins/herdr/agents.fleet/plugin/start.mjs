import { spawn } from "node:child_process";
import { openSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createConnection } from "node:net";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STATE = process.env.HERDR_PLUGIN_STATE_DIR ?? join(ROOT, ".state");
const PORT = Number(process.env.FLEET_PORT ?? 7777);

function inUse(port) {
  return new Promise((resolve) => {
    const s = createConnection({ port, host: "127.0.0.1" });
    s.on("connect", () => {
      s.destroy();
      resolve(true);
    });
    s.on("error", () => resolve(false));
    setTimeout(() => {
      s.destroy();
      resolve(false);
    }, 600);
  });
}

if (!existsSync(STATE)) mkdirSync(STATE, { recursive: true });

if (await inUse(PORT)) {
  process.stdout.write(`fleet already listening on ${PORT}\n`);
  process.exit(0);
}

const log = openSync(join(STATE, "server.log"), "a");
const child = spawn(process.execPath, [join(ROOT, "server.mjs")], {
  cwd: ROOT,
  detached: true,
  stdio: ["ignore", log, log],
  env: { ...process.env, FLEET_PORT: String(PORT) },
});
child.unref();
writeFileSync(join(STATE, "server.pid"), String(child.pid));
process.stdout.write(`fleet started on ${PORT}, pid ${child.pid}\n`);
