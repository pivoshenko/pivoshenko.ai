import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.FLEET_PORT ?? 7777);
const URL_ = `http://127.0.0.1:${PORT}`;

await new Promise((resolve) => {
  const p = spawn(process.execPath, [join(ROOT, "plugin", "start.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  p.on("exit", resolve);
});

const opener =
  process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open";
spawn(opener, [URL_], { detached: true, stdio: "ignore" }).unref();
process.stdout.write(`${URL_}\n`);
