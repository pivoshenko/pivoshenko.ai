import { execFile } from "node:child_process";
import { readdirSync, statSync, openSync, readSync, closeSync, existsSync, readFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { homedir } from "node:os";

const PROJECTS = join(homedir(), ".claude", "projects");
const CODEX_SESSIONS = process.env.FLEET_CODEX_DIR || join(homedir(), ".codex", "sessions");
const PI_SESSIONS =
  process.env.FLEET_PI_DIR ||
  join(process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent"), "sessions");
const HERDR = process.env.HERDR_BIN_PATH || "herdr";

const COLD_TAIL = Number(process.env.FLEET_COLD_TAIL ?? 0);

const WINDOW_MS = Number(process.env.FLEET_WINDOW_MIN ?? 120) * 60 * 1000;

const ACTIVE_MS = 90 * 1000;

const CLOSED_MS = Number(process.env.FLEET_CLOSED_MIN ?? 1440) * 60 * 1000;
const CLOSED_MAX = Number(process.env.FLEET_CLOSED_MAX ?? 60);
const CLOSED_PER_TICK = 8;

const TURN_MAX = Number(process.env.FLEET_TURNS ?? 30);
const TURN_CHARS = 800;

function herdrSnapshot() {
  return new Promise((resolve) => {
    execFile(HERDR, ["api", "snapshot"], { maxBuffer: 32 * 1024 * 1024, timeout: 5000 }, (err, stdout) => {
      if (err) {

        return resolve({ agents: [], available: false, reason: err.code === "ENOENT" ? "herdr not installed" : "no herdr server" });
      }
      try {
        const d = JSON.parse(stdout);
        const snap = d.result?.snapshot ?? d.snapshot ?? {};
        resolve({ agents: snap.agents ?? [], available: true });
      } catch (e) {
        resolve({ agents: [], available: false, reason: `unparseable snapshot: ${e.message}` });
      }
    });
  });
}

const repoCache = new Map();

function repoOf(cwd) {
  if (!cwd) return null;
  if (repoCache.has(cwd)) return repoCache.get(cwd);
  let dir = cwd;
  let found = null;
  for (let i = 0; i < 40; i++) {
    if (existsSync(join(dir, ".git"))) {
      found = basename(dir);
      break;
    }
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  const repo = found ?? basename(cwd) ?? null;
  repoCache.set(cwd, repo);
  return repo;
}

let indexedAt = 0;
let transcripts = new Map();

function walkJsonl(root, depth, out, idFrom) {
  let entries = [];
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(root, e.name);
    if (e.isDirectory()) {
      if (depth > 0) walkJsonl(full, depth - 1, out, idFrom);
      continue;
    }
    if (!e.name.endsWith(".jsonl")) continue;
    const id = idFrom(e.name);
    if (!id) continue;
    try {
      const st = statSync(full);
      out.set(id, { path: full, mtime: st.mtimeMs, size: st.size });
    } catch {
      continue;
    }
  }
  return out;
}

function indexCodex() {
  return walkJsonl(CODEX_SESSIONS, 3, new Map(), (name) => {
    const m = name.match(/^rollout-.*?-([0-9a-fA-F-]{16,})\.jsonl$/);
    return m ? m[1] : name.slice(0, -6);
  });
}

function indexPi() {
  return walkJsonl(PI_SESSIONS, 2, new Map(), (name) => {
    const base = name.slice(0, -6);
    const i = base.indexOf("_");
    return i > 0 ? base.slice(i + 1) : base;
  });
}

function indexTranscripts() {
  if (Date.now() - indexedAt < 10_000) return transcripts;
  const found = new Map();
  let dirs = [];
  try {
    dirs = readdirSync(PROJECTS, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch {
    return transcripts;
  }
  for (const dir of dirs) {
    const full = join(PROJECTS, dir.name);
    let entries = [];
    try {
      entries = readdirSync(full);
    } catch {
      continue;
    }
    for (const f of entries) {
      if (!f.endsWith(".jsonl")) continue;
      const path = join(full, f);
      let mtime = 0;
      try {
        mtime = statSync(path).mtimeMs;
      } catch {
        continue;
      }
      let size = 0;
      try {
        size = statSync(path).size;
      } catch {
        size = 0;
      }
      found.set(f.slice(0, -6), { path, mtime, size });
    }
  }
  indexedAt = Date.now();
  transcripts = found;
  return found;
}

const cache = new Map();

const APPLIERS = { claude: apply, codex: applyCodex, pi: applyPi };

let providerIndexedAt = 0;
let providerIndex = { codex: new Map(), pi: new Map() };

function indexProviders() {
  if (Date.now() - providerIndexedAt < 10_000) return providerIndex;
  providerIndex = { codex: indexCodex(), pi: indexPi() };
  providerIndexedAt = Date.now();
  return providerIndex;
}

function readTail(path, from) {
  const size = statSync(path).size;
  if (size <= from) return { size, chunk: "" };
  const start = from > 0 ? from : COLD_TAIL > 0 ? Math.max(0, size - COLD_TAIL) : 0;
  const len = size - start;
  const buf = Buffer.allocUnsafe(len);
  const fd = openSync(path, "r");
  try {
    readSync(fd, buf, 0, len, start);
  } finally {
    closeSync(fd);
  }
  return { size, chunk: buf.toString("utf8"), partialHead: from === 0 && start > 0 };
}

function toolArg(input = {}) {
  const v =
    input.description ||
    input.file_path ||
    input.command ||
    input.pattern ||
    input.path ||
    input.prompt ||
    input.url ||
    input.skill ||
    input.query ||
    "";
  return String(v).replace(/\s+/g, " ").trim().slice(0, 160);
}

function speech(d) {
  if (d.isMeta) return null;
  const msg = d.message ?? {};
  const c = msg.content;
  const role = d.type === "user" ? "you" : d.type === "assistant" ? "agent" : null;
  if (!role) return null;

  let text = "";
  let hasImage = false;
  if (typeof c === "string") {
    text = c;
  } else if (Array.isArray(c)) {
    if (c.some((b) => b && b.type === "tool_result")) return null;
    for (const b of c) {
      if (!b || typeof b !== "object") continue;
      if (b.type === "text" && b.text) text += (text ? "\n" : "") + b.text;
      if (b.type === "image") hasImage = true;
    }
  }
  text = text.replace(/\s+/g, " ").trim();
  if (!text && hasImage) text = "[image]";
  if (!text) return null;
  return {
    role,
    text: text.length > TURN_CHARS ? `${text.slice(0, TURN_CHARS)}\u2026` : text,
    at: d.timestamp ?? null,
    image: hasImage,
  };
}

function applyCodex(s, d) {
  const kind = d.type;
  const q = d.payload ?? {};
  if (d.timestamp) s.lastAt = d.timestamp;

  if (kind === "session_meta") {
    if (q.cwd && q.cwd !== ".") s.cwd = q.cwd;
    if (q.git?.branch) s.branch = q.git.branch;
  }

  if (kind === "turn_context") {
    if (q.cwd) s.cwd = q.cwd;
    if (q.model) s.model = q.model;
    if (q.effort) s.effort = q.effort;
  }

  if (kind === "token_usage_record" && q.usage) {
    const u = q.usage;
    const input = u.input_tokens ?? 0;
    const read = u.cached_input_tokens ?? 0;
    const write = u.cache_write_input_tokens ?? 0;
    const output = u.output_tokens ?? 0;
    s.usage.input += Math.max(0, input - read);
    s.usage.read += read;
    s.usage.write5m += write;
    s.usage.output += output;
    s.usage.total += Math.max(0, input - read) + read + write + output;
    const thread = q.thread_token_usage;
    if (thread?.total_tokens) s.contextTokens = thread.total_tokens;
  }

  if (kind !== "response_item") return;

  if (q.type === "message" && Array.isArray(q.content)) {
    const text = q.content
      .map((b) => (b && typeof b === "object" ? b.text ?? "" : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (q.role === "user" && !s.title && text) s.title = text.slice(0, 80);
    if (q.role === "user") s.prompt = text.slice(0, 400);
    if (text) {
      s.turns.push({
        role: q.role === "user" ? "you" : "agent",
        text: text.length > TURN_CHARS ? `${text.slice(0, TURN_CHARS)}\u2026` : text,
        at: d.timestamp ?? null,
      });
      if (s.turns.length > TURN_MAX) s.turns.shift();
    }
    s.lastKind = q.role === "user" ? "user" : "assistant_text";
  }

  if (q.type === "function_call" || q.type === "local_shell_call") {
    let arg = "";
    if (q.type === "local_shell_call") {
      const cmd = q.action?.command;
      arg = Array.isArray(cmd) ? cmd.join(" ") : String(cmd ?? "");
    } else if (typeof q.arguments === "string") {
      try {
        const parsed = JSON.parse(q.arguments);
        arg = toolArg(parsed) || (Array.isArray(parsed.command) ? parsed.command.join(" ") : "");
      } catch {
        arg = q.arguments;
      }
    }
    const call = {
      name: q.name ?? (q.type === "local_shell_call" ? "shell" : "tool"),
      arg: String(arg).replace(/\s+/g, " ").trim().slice(0, 160),
      at: d.timestamp ?? null,
    };
    s.tool = call;
    s.lastKind = "tool_use";
    s.recent.push(call);
    if (s.recent.length > 24) s.recent.shift();
  }

  if (q.type === "function_call_output") s.lastKind = "tool_result";
}

function applyPi(s, d) {
  if (d.timestamp) s.lastAt = d.timestamp;

  if (d.type === "session" && d.cwd) s.cwd = d.cwd;
  if (d.type === "session_info" && d.name) s.title = d.name;
  if (d.type === "model_change") {
    if (d.modelId) s.model = d.modelId;
  }
  if (d.type === "thinking_level_change" && d.thinkingLevel) s.effort = d.thinkingLevel;
  if (d.type !== "message") return;

  const m = d.message ?? {};
  if (m.model) s.model = m.model;
  if (m.providerThinkingLevel) s.effort = m.providerThinkingLevel;

  if (m.usage) {
    const u = m.usage;
    s.usage.input += u.input ?? 0;
    s.usage.output += u.output ?? 0;
    s.usage.read += u.cacheRead ?? 0;
    s.usage.write5m += u.cacheWrite ?? 0;
    s.usage.write1h += u.cacheWrite1h ?? 0;
    s.usage.total +=
      (u.input ?? 0) + (u.output ?? 0) + (u.cacheRead ?? 0) + (u.cacheWrite ?? 0) + (u.cacheWrite1h ?? 0);
    if (u.totalTokens) s.contextTokens = u.totalTokens;
  }

  const content = m.content;
  let text = "";
  if (typeof content === "string") text = content;
  else if (Array.isArray(content)) {
    for (const b of content) {
      if (!b || typeof b !== "object") continue;
      if (b.type === "text" && b.text) text += (text ? " " : "") + b.text;
      if (b.type === "toolCall") {
        const call = {
          name: b.name ?? "tool",
          arg: toolArg(b.arguments ?? {}),
          at: d.timestamp ?? null,
        };
        s.tool = call;
        s.lastKind = "tool_use";
        s.recent.push(call);
        if (s.recent.length > 24) s.recent.shift();
      }
    }
  }
  text = text.replace(/\s+/g, " ").trim();

  if (m.role === "toolResult") {
    s.lastKind = "tool_result";
    return;
  }
  if (!text) return;
  if (m.role === "user") {
    s.prompt = text.slice(0, 400);
    if (!s.title) s.title = text.slice(0, 80);
    s.lastKind = "user";
  } else {
    s.lastKind = "assistant_text";
  }
  s.turns.push({
    role: m.role === "user" ? "you" : "agent",
    text: text.length > TURN_CHARS ? `${text.slice(0, TURN_CHARS)}\u2026` : text,
    at: d.timestamp ?? null,
  });
  if (s.turns.length > TURN_MAX) s.turns.shift();
}

function blankState() {
  return {
    title: null,
    prompt: null,
    tool: null,
    recent: [],
    model: null,
    effort: null,
    contextTokens: null,
    branch: null,
    cwd: null,
    lastAt: null,
    lastKind: null,
    subagents: new Map(),
    skills: new Map(),
    mcps: new Map(),
    turns: [],
    usage: blankUsage(),
  };
}

function scanTranscript(sessionId, path, kind = "claude") {
  const applyFn = APPLIERS[kind] ?? apply;
  const prev = cache.get(sessionId) ?? { offset: 0, state: blankState() };
  let size;
  let chunk;
  let partialHead = false;
  try {
    ({ size, chunk, partialHead } = readTail(path, prev.offset));
  } catch {
    return prev.state;
  }
  if (!chunk) {
    cache.set(sessionId, { offset: size, state: prev.state });
    return prev.state;
  }

  const s = prev.state;
  const lines = chunk.split("\n");

  const tail = lines.pop() ?? "";
  if (partialHead) lines.shift();

  for (const line of lines) {
    if (!line.trim()) continue;
    let d;
    try {
      d = JSON.parse(line);
    } catch {
      continue;
    }
    applyFn(s, d);
  }

  cache.set(sessionId, { offset: size - Buffer.byteLength(tail, "utf8"), state: s });
  return s;
}

function apply(s, d) {
  if (d.type === "ai-title" && d.aiTitle) s.title = d.aiTitle;
  if (d.type === "last-prompt" && d.lastPrompt) {
    s.prompt = String(d.lastPrompt).replace(/\s+/g, " ").trim().slice(0, 400);
  }
  if (d.gitBranch) s.branch = d.gitBranch;
  if (d.cwd) s.cwd = d.cwd;
  if (d.timestamp) s.lastAt = d.timestamp;

  const msg = d.message ?? {};
  if (d.type === "assistant") {
    if (msg.model) s.model = msg.model;
    if (d.effort) s.effort = d.effort;
    const u = msg.usage;
    if (u) {

      const ctx =
        (u.input_tokens ?? 0) +
        (u.cache_read_input_tokens ?? 0) +
        (u.cache_creation_input_tokens ?? 0);
      if (ctx > 0) s.contextTokens = ctx;
      meterUsage(s.usage, u);
    }
    s.lastKind = "assistant_text";
  }
  if (d.type === "user") s.lastKind = "user";

  const said = speech(d);
  if (said) {
    s.turns.push(said);
    if (s.turns.length > TURN_MAX) s.turns.shift();
  }

  if (d.toolUseResult) s.lastKind = "tool_result";

  const side = d.isSidechain === true;

  if (Array.isArray(msg.content)) {
    for (const b of msg.content) {
      if (!b || typeof b !== "object" || b.type !== "tool_use") continue;
      const call = { name: b.name, arg: toolArg(b.input), at: d.timestamp ?? null };

      if (b.name === "Skill") {
        const id = (b.input ?? {}).skill;
        if (id) {
          const prev = s.skills.get(id);
          s.skills.set(id, {
            name: id,
            args: (b.input ?? {}).args ?? prev?.args ?? null,
            count: (prev?.count ?? 0) + 1,
            lastAt: d.timestamp ?? prev?.lastAt ?? null,
          });
        }
      }

      if (b.name.startsWith("mcp__")) {
        const [, server, ...rest] = b.name.split("__");
        const tool = rest.join("__");
        if (server) {
          const prev = s.mcps.get(server) ?? { server, tools: new Set(), count: 0, lastAt: null };
          if (tool) prev.tools.add(tool);
          prev.count += 1;
          prev.lastAt = d.timestamp ?? prev.lastAt;
          s.mcps.set(server, prev);
        }
      }

      if (b.name === "Agent") {
        const i = b.input ?? {};
        const key = i.name || b.id;
        s.subagents.set(key, {
          key,
          name: i.name ?? null,
          type: i.subagent_type ?? "general-purpose",
          description: i.description ?? null,
          model: i.model ?? null,
          startedAt: d.timestamp ?? null,
        });
      }

      if (side) {
        const sub = s.subagents.get(d.parentUuid);
        if (sub) sub.tool = call;
        continue;
      }
      s.tool = call;
      s.lastKind = "tool_use";
      s.recent.push(call);
      if (s.recent.length > 24) s.recent.shift();
    }
  }
}

function deriveStatus(state, idleMs) {
  if (idleMs == null || idleMs > ACTIVE_MS) return "idle";
  if (state.lastKind === "tool_use" || state.lastKind === "tool_result") return "working";
  if (state.lastKind === "user") return "working";
  return "idle";
}

const summaries = new Map();

function summarize(sessionId, entry) {
  const key = `${entry.path}:${entry.mtime}:${entry.size}`;
  const hit = summaries.get(sessionId);
  if (hit && hit.key === key) return hit.value;

  let text;
  try {
    text = readFileSync(entry.path, "utf8");
  } catch {
    return null;
  }

  const wrote = new Set();
  const edited = new Set();
  const read = new Set();
  const skills = new Map();
  const mcps = new Map();
  const tools = new Map();
  let title = null;
  let prompt = null;
  let branch = null;
  let cwd = null;
  let model = null;
  let effort = null;
  let firstAt = null;
  let lastAt = null;
  let sidechains = 0;
  const turns = [];
  const usage = blankUsage();

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let d;
    try {
      d = JSON.parse(line);
    } catch {
      continue;
    }
    if (d.type === "ai-title" && d.aiTitle) title = d.aiTitle;
    if (d.type === "last-prompt" && d.lastPrompt) {
      prompt = String(d.lastPrompt).replace(/\s+/g, " ").trim().slice(0, 400);
    }
    if (d.gitBranch) branch = d.gitBranch;
    if (d.cwd) cwd = d.cwd;
    if (d.timestamp) {
      if (!firstAt) firstAt = d.timestamp;
      lastAt = d.timestamp;
    }
    if (d.isSidechain === true) sidechains += 1;
    const said = speech(d);
    if (said) {
      turns.push(said);
      if (turns.length > TURN_MAX) turns.shift();
    }
    const msg = d.message ?? {};
    if (d.type === "assistant") {
      if (msg.model) model = msg.model;
      if (d.effort) effort = d.effort;
      if (msg.usage) meterUsage(usage, msg.usage);
    }
    if (!Array.isArray(msg.content)) continue;
    for (const b of msg.content) {
      if (!b || typeof b !== "object" || b.type !== "tool_use") continue;
      const name = b.name ?? "";
      const i = b.input ?? {};
      tools.set(name, (tools.get(name) ?? 0) + 1);
      if (name === "Write" && i.file_path) wrote.add(i.file_path);
      if ((name === "Edit" || name === "NotebookEdit") && i.file_path) edited.add(i.file_path);
      if (name === "Read" && i.file_path) read.add(i.file_path);
      if (name === "Skill" && i.skill) skills.set(i.skill, (skills.get(i.skill) ?? 0) + 1);
      if (name.startsWith("mcp__")) {
        const [, server, ...rest] = name.split("__");
        if (server) {
          const e = mcps.get(server) ?? { server, tools: new Set(), count: 0 };
          if (rest.length) e.tools.add(rest.join("__"));
          e.count += 1;
          mcps.set(server, e);
        }
      }
    }
  }

  const start = firstAt ? Date.parse(firstAt) : null;
  const end = lastAt ? Date.parse(lastAt) : entry.mtime;
  const value = {
    id: sessionId,
    sessionId,
    title,
    prompt,
    branch,
    cwd,
    repo: repoOf(cwd),
    model,
    effort,
    startedAt: firstAt,
    endedAt: lastAt ?? new Date(entry.mtime).toISOString(),
    durationMs: start && end ? Math.max(0, end - start) : null,
    wrote: [...wrote],
    edited: [...edited],
    readCount: read.size,
    bashCount: tools.get("Bash") ?? 0,
    toolCount: [...tools.values()].reduce((a, b) => a + b, 0),
    tools: [...tools.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    skills: [...skills.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    mcps: [...mcps.values()]
      .map((m) => ({ server: m.server, tools: [...m.tools].sort(), count: m.count }))
      .sort((a, b) => b.count - a.count),
    sidechains,
    turns,
    usage,
    sizeBytes: entry.size,
  };
  summaries.set(sessionId, { key, value });
  return value;
}

function meterUsage(acc, usage) {
  if (!usage) return;
  const cc = usage.cache_creation ?? {};
  const w5 = cc.ephemeral_5m_input_tokens ?? 0;
  const w1 = cc.ephemeral_1h_input_tokens ?? 0;
  const creation = usage.cache_creation_input_tokens ?? 0;
  const write5m = w5 || w1 ? w5 : creation;
  const write1h = w1;
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const read = usage.cache_read_input_tokens ?? 0;

  acc.input += input;
  acc.output += output;
  acc.write5m += write5m;
  acc.write1h += write1h;
  acc.read += read;
  acc.total += input + output + write5m + write1h + read;

}

function blankUsage() {
  return { input: 0, output: 0, write5m: 0, write1h: 0, read: 0, total: 0 };
}

const KINDS = {
  claude: "Claude Code",
  codex: "Codex",
  copilot: "Copilot CLI",
  amp: "Amp",
  opencode: "OpenCode",
  pi: "Pi",
  gemini: "Gemini",
  cursor: "Cursor Agent",
  droid: "Droid",
  grok: "Grok",
  qwen: "Qwen Code",
  devin: "Devin",
};

const READERS = new Set(["claude", "codex", "pi"]);

const STATUS = new Set(["working", "idle", "blocked", "done", "unknown"]);

const PANE_ID = /^[A-Za-z0-9_-]{1,32}:[A-Za-z0-9_-]{1,32}$/;

export async function focusPane(target) {
  if (typeof target !== "string" || !PANE_ID.test(target)) {
    return { ok: false, error: "bad pane id" };
  }
  const herd = await herdrSnapshot();
  if (!herd.available) return { ok: false, error: herd.reason ?? "no herdr server" };
  const known = herd.agents.some((a) => a.pane_id === target);
  if (!known) return { ok: false, error: "no agent in that pane" };

  return new Promise((resolve) => {
    execFile(HERDR, ["agent", "focus", target], { timeout: 5000 }, (err, stdout) => {
      if (err) return resolve({ ok: false, error: err.message });
      try {
        const d = JSON.parse(stdout);
        resolve({ ok: true, pane: d.result?.agent?.pane_id ?? target });
      } catch {
        resolve({ ok: true, pane: target });
      }
    });
  });
}

export async function collect() {
  const herd = await herdrSnapshot();
  const index = indexTranscripts();
  const now = Date.now();

  const build = (sessionId, entry, pane, kind = "claude") => {
    const t = entry ? scanTranscript(sessionId, entry.path, kind) : blankState();
    const lastAt = t.lastAt ? Date.parse(t.lastAt) : (entry?.mtime ?? null);
    const idleMs = lastAt ? Math.max(0, now - lastAt) : null;

    const status = pane
      ? STATUS.has(pane.agent_status)
        ? pane.agent_status
        : "unknown"
      : deriveStatus(t, idleMs);

    const cwd = t.cwd ?? pane?.cwd ?? null;

    return {
      id: sessionId ?? pane?.pane_id,
      sessionId: sessionId ?? null,
      name: pane?.name ?? null,
      agent: kind,
      kind,
      kindLabel: KINDS[kind] ?? kind,
      hasReader: READERS.has(kind),
      matched: Boolean(entry),
      source: pane ? "herdr" : "transcript",
      status,
      statusDerived: !pane,
      focused: pane?.focused === true,
      pane: pane?.pane_id ?? null,
      tab: pane?.tab_id ?? null,
      workspace: pane?.workspace_id ?? null,
      cwd,
      repo: repoOf(cwd),
      branch: t.branch,

      title: t.title ?? pane?.terminal_title_stripped ?? null,
      prompt: t.prompt,
      tool: t.tool,
      recent: t.recent.slice(-16),
      turns: t.turns.slice(-TURN_MAX),
      model: t.model,
      effort: t.effort,
      contextTokens: t.contextTokens,
      usage: t.usage,
      lastAt: t.lastAt ?? (entry ? new Date(entry.mtime).toISOString() : null),
      idleMs,
      subagents: [...t.subagents.values()],
      skills: [...t.skills.values()].sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name)),
      mcps: [...t.mcps.values()]
        .map((m) => ({ server: m.server, tools: [...m.tools].sort(), count: m.count, lastAt: m.lastAt }))
        .sort((a, b) => (b.count - a.count) || a.server.localeCompare(b.server)),
      hasTranscript: Boolean(entry),
    };
  };

  const providers = indexProviders();
  const claimedBy = { claude: new Set(), codex: new Set(), pi: new Set() };

  const pickEntry = (kind, sessionId) => {
    if (kind === "claude") return sessionId ? index.get(sessionId) ?? null : null;
    const idx = providers[kind];
    if (!idx) return null;
    if (sessionId && idx.has(sessionId)) return idx.get(sessionId);
    const fresh = [...idx.entries()].filter(([id, e]) => now - e.mtime < ACTIVE_MS * 10 && !claimedBy[kind].has(id));
    return fresh.length === 1 ? fresh[0][1] : null;
  };

  const agents = [];

  for (const pane of herd.agents) {
    const kind = pane.agent ?? "claude";
    const sessionId = pane.agent_session?.value ?? null;
    const entry = READERS.has(kind) ? pickEntry(kind, sessionId) : null;
    if (entry) {
      const set = claimedBy[kind];
      for (const [id, e] of kind === "claude" ? index : providers[kind]) {
        if (e.path === entry.path) set.add(id);
      }
    }
    if (sessionId) claimedBy[kind]?.add(sessionId);
    agents.push(build(sessionId, entry, pane, kind));
  }

  const orphanWindow = herd.available ? 5 * 60 * 1000 : WINDOW_MS;
  for (const [kind, idx] of [["claude", index], ["codex", providers.codex], ["pi", providers.pi]]) {
    for (const [sessionId, entry] of idx) {
      if (claimedBy[kind].has(sessionId)) continue;
      if (now - entry.mtime > orphanWindow) continue;
      agents.push(build(sessionId, entry, null, kind));
    }
  }

  const rank = { blocked: 0, working: 1, done: 2, idle: 3, unknown: 4 };
  agents.sort(
    (x, y) =>
      (rank[x.status] ?? 9) - (rank[y.status] ?? 9) ||
      (x.idleMs ?? Infinity) - (y.idleMs ?? Infinity),
  );

  const closedCandidates = [];
  for (const [sessionId, entry] of index) {
    if (claimedBy.claude.has(sessionId)) continue;
    if (now - entry.mtime > CLOSED_MS) continue;
    if (agents.some((a) => a.sessionId === sessionId)) continue;
    closedCandidates.push([sessionId, entry]);
  }
  closedCandidates.sort((a, b) => b[1].mtime - a[1].mtime);

  const closed = [];
  let parsed = 0;
  for (const [sessionId, entry] of closedCandidates.slice(0, CLOSED_MAX)) {
    const cachedKey = `${entry.path}:${entry.mtime}:${entry.size}`;
    const warm = summaries.get(sessionId);
    if (!warm || warm.key !== cachedKey) {
      if (parsed >= CLOSED_PER_TICK) continue;
      parsed += 1;
    }
    const sum = summarize(sessionId, entry);
    if (sum && (sum.toolCount > 0 || sum.title)) closed.push(sum);
  }
  closed.sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt));

  const counts = { total: agents.length, working: 0, idle: 0, blocked: 0, done: 0, unknown: 0 };
  for (const a of agents) counts[a.status] = (counts[a.status] ?? 0) + 1;

  return {
    ts: new Date().toISOString(),
    counts,
    agents,
    subagentCount: agents.reduce((n, a) => n + a.subagents.length, 0),
    repos: [...new Set([...agents, ...closed].map((a) => a.repo).filter(Boolean))].sort(),
    dirs: [...new Set([...agents, ...closed].map((a) => a.cwd).filter(Boolean))].length,
    totals: (() => {
      const t = blankUsage();
      for (const a of [...agents, ...closed]) {
        if (!a.usage) continue;
        for (const k of ["input", "output", "write5m", "write1h", "read", "total"]) {
          t[k] += a.usage[k] ?? 0;
        }
      }
      return t;
    })(),
    skillCount: new Set(agents.flatMap((a) => a.skills.map((x) => x.name))).size,
    mcpCount: new Set(agents.flatMap((a) => a.mcps.map((x) => x.server))).size,
    closed,
    closedTotal: closedCandidates.length,
    closedWindowMin: CLOSED_MS / 60000,
    readers: [...READERS],
    kinds: KINDS,
    herdr: { available: herd.available, reason: herd.reason ?? null },
    windowMin: WINDOW_MS / 60000,
  };
}
