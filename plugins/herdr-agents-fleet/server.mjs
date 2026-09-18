import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { collect } from "./fleet.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "public");
const PORT = Number(process.env.FLEET_PORT ?? 7777);
const POLL_MS = Number(process.env.FLEET_POLL_MS ?? 1500);

const GRACE_MS = Number(process.env.FLEET_HERDR_GRACE_MS ?? 30_000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const clients = new Set();
let last = "";

let herdrSeen = false;
let herdrLostAt = null;

function outliveHerdr(fleet) {

  if (fleet.herdr?.available) {
    herdrSeen = true;
    herdrLostAt = null;
    return;
  }

  if (!herdrSeen) return;
  if (herdrLostAt === null) {
    herdrLostAt = Date.now();
    return;
  }
  if (Date.now() - herdrLostAt < GRACE_MS) return;
  process.stdout.write(`herdr gone for ${Math.round(GRACE_MS / 1000)}s, shutting down\n`);
  process.exit(0);
}

async function tick() {
  let payload;
  try {
    const fleet = await collect();
    outliveHerdr(fleet);
    payload = JSON.stringify(fleet);
  } catch (e) {
    payload = JSON.stringify({ ts: new Date().toISOString(), agents: [], counts: {}, error: e.message });
  }

  if (payload !== last) {
    last = payload;
    for (const res of clients) res.write(`data: ${payload}\n\n`);
  }
}

setInterval(tick, POLL_MS).unref?.();
tick();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/events") {
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    });
    res.write(": open\n\n");
    if (last) res.write(`data: ${last}\n\n`);
    clients.add(res);

    const ka = setInterval(() => res.write(": ka\n\n"), 25_000);
    req.on("close", () => {
      clearInterval(ka);
      clients.delete(res);
    });
    return;
  }

  if (url.pathname === "/api/fleet") {
    res.writeHead(200, { "content-type": TYPES[".json"], "cache-control": "no-store" });
    res.end(last || JSON.stringify(await collect()));
    return;
  }

  const rel = url.pathname === "/" ? "index.html" : normalize(url.pathname).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  const file = join(ROOT, rel);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`fleet  http://127.0.0.1:${PORT}  polling herdr every ${POLL_MS}ms\n`);
});
