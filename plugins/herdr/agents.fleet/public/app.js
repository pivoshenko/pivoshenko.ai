const h = React.createElement;
const { useState, useEffect, useMemo, useRef, useCallback } = React;
const P = window.Pivoshenko;

// lucide icons, called by name - vendor/lucide.js exposes every icon as [tag, attrs] pairs
const ICONS = {
  blocked: "CirclePause",
  working: "LoaderCircle",
  done: "CircleCheck",
  idle: "Circle",
  stale: "Clock",
  branch: "GitBranch",
  terminal: "Terminal",
  arrow: "ArrowRight",
  close: "X",
  info: "Info",
  alert: "TriangleAlert",
  prompt: "ChevronRight",
  top: "ArrowUp",
};

function Icon({ name, size = 16, spin = false, className }) {
  const parts = window.lucide?.[ICONS[name] ?? name];
  if (!parts) return null;
  return h(
    "svg",
    {
      className: ["fleet-i", spin ? "fleet-i--spin" : null, className].filter(Boolean).join(" "),
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      focusable: false,
    },
    parts.map(([tag, attrs], i) => h(tag, { key: i, ...attrs })),
  );
}

const STATUS = {
  blocked: { icon: "blocked", word: "blocked", accent: "yellow", hint: "waiting on you" },
  working: { icon: "working", word: "working", accent: "blue", spin: true, hint: "running now" },
  done: { icon: "done", word: "done", accent: "green", hint: "finished, unread" },
  idle: { icon: "idle", word: "idle", accent: "sky", hint: "nothing queued" },
  stale: { icon: "stale", word: "stale", accent: "mauve", hint: "no herdr pane, last seen only" },
  unknown: { icon: "idle", word: "unknown", accent: "rosewater", hint: "unclassified" },
};
const ORDER = ["blocked", "working", "done", "idle", "stale", "unknown"];
const OPTIONAL = new Set(["stale", "unknown"]);

function statusIcon(key, size) {
  const s = STATUS[key] ?? STATUS.unknown;
  return h(Icon, { name: s.icon, spin: Boolean(s.spin), size });
}

function tokens(n) {
  if (n == null) return null;
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}

function age(ms) {
  if (ms == null) return null;
  const s = Math.round(ms / 1000);
  if (s < 45) return "now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const hr = Math.floor(m / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

function title(word) {
  return String(word).replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function model(id) {
  if (!id) return null;
  return String(id).replace(/^claude-/, "").replace(/-\d{8}$/, "");
}

function clock(ts) {
  return ts ? new Date(ts).toLocaleTimeString() : null;
}

function useFleet() {
  const [fleet, setFleet] = useState(null);
  const [state, setState] = useState("down");
  const seen = useRef(0);

  useEffect(() => {
    let es;
    let stop = false;

    const open = () => {
      if (stop) return;
      es = new EventSource("/events");
      es.onmessage = (e) => {
        seen.current = Date.now();
        setState("live");
        try {
          setFleet(JSON.parse(e.data));
        } catch {

        }
      };
      es.onerror = () => {
        setState("down");
        es.close();

        setTimeout(open, 2000);
      };
    };
    open();

    const watch = setInterval(() => {
      if (seen.current && Date.now() - seen.current > 20_000) setState("stale");
    }, 4000);

    return () => {
      stop = true;
      clearInterval(watch);
      es?.close();
    };
  }, []);

  return [fleet, state];
}

function AgentCard({ agent, onOpen }) {
  const s = STATUS[agent.status] ?? STATUS.unknown;

  const meta = [];
  if (agent.branch) meta.push(h("span", { className: "fleet-opt" }, h(Icon, { name: "branch", size: 12 }), agent.branch));
  if (agent.contextTokens) meta.push(`ctx ${tokens(agent.contextTokens)}`);

  const tags = [];
  if (agent.kind && agent.kind !== "claude") tags.push(agent.kindLabel ?? agent.kind);
  if (agent.focused) tags.push("focused");
  if (agent.model) tags.push(model(agent.model));
  if (agent.effort) tags.push(agent.effort);
  if (agent.subagents.length) tags.push(`${agent.subagents.length} sub`);

  const now = h(
    "div",
    { className: "fleet-card__now" },
    h("span", { className: "fleet-card__ps" }, h(Icon, { name: "terminal", size: 14 })),
    h(
      "span",
      { className: "fleet-card__tool" },
      agent.tool
        ? [h("b", { key: "n" }, agent.tool.name), agent.tool.arg ? `  ${agent.tool.arg}` : ""]
        : "no tool calls yet",
    ),
    h("span", { className: "fleet-card__go" }, h(Icon, { name: "arrow", size: 14 })),
  );

  return h(
    "div",
    {
      className: "fleet-hit",
      role: "button",
      tabIndex: 0,
      "aria-label": `${agent.name ?? agent.title ?? agent.pane}, ${s.word}. Show activity`,
      onClick: () => onOpen(agent.id),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(agent.id);
        }
      },
    },
    h(
      P.Card,
      {
        className: "fleet-card",
        accent: s.accent,
        glyph: statusIcon(agent.status),

        eyebrow: [
          h(
            "span",
            { key: "t", className: "fleet-card__eye" },
            [agent.repo ?? agent.cwd ?? "unknown repository", agent.pane, age(agent.idleMs)]
              .filter(Boolean)
              .join(" · "),
          ),
        ],
        title: agent.name ?? agent.title ?? agent.pane,

        description: agent.name ? agent.title : null,
        tags,
        meta,
        clamp: true,
        level: 3,
      },
      now,
    ),
  );
}

function dur(ms) {
  if (ms == null) return null;
  const m = Math.round(ms / 60000);
  if (m < 1) return "<1m";
  if (m < 60) return `${m}m`;
  const hr = Math.floor(m / 60);
  return `${hr}h ${m % 60}m`;
}

function base(path) {
  return String(path).split("/").filter(Boolean).pop() ?? path;
}

function ClosedCard({ agent, onOpen }) {
  const files = agent.wrote.length + agent.edited.length;
  const meta = [];
  if (files) meta.push(`${files} ${files === 1 ? "file" : "files"}`);
  if (agent.bashCount) meta.push(`${agent.bashCount} cmds`);
  const d = dur(agent.durationMs);
  if (d) meta.push(d);

  const tags = [];
  if (agent.model) tags.push(model(agent.model));
  if (agent.skills.length) tags.push(`${agent.skills.length} skills`);
  if (agent.mcps.length) tags.push(`${agent.mcps.length} mcp`);

  const made = files
    ? [...agent.wrote, ...agent.edited].slice(0, 3).map(base).join(", ")
    : agent.tools.slice(0, 3).map((t) => `${t.name} x${t.count}`).join(", ");

  return h(
    "div",
    {
      className: "fleet-hit",
      role: "button",
      tabIndex: 0,
      "aria-label": `${agent.title ?? agent.sessionId}, finished. Show what it made`,
      onClick: () => onOpen(agent.id),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(agent.id);
        }
      },
    },
    h(
      P.Card,
      {
        className: "fleet-card",
        accent: STATUS.done.accent,
        glyph: h(Icon, { name: "done" }),
        eyebrow: [agent.repo ?? "unknown repository", age(Date.now() - Date.parse(agent.endedAt))]
          .filter(Boolean)
          .join(" \u00b7 "),
        title: agent.title ?? agent.sessionId,
        tags,
        meta,
        clamp: true,
        level: 3,
      },
      h(
        "div",
        { className: "fleet-card__now" },
        h("span", { className: "fleet-card__ps" }, h(Icon, { name: files ? "branch" : "terminal", size: 14 })),
        h("span", { className: "fleet-card__tool" }, made || "no tool calls"),
        h("span", { className: "fleet-card__go" }, h(Icon, { name: "arrow", size: 14 })),
      ),
    ),
  );
}

function Fold({ label, count, open, onToggle, children }) {
  return h(
    "div",
    { className: "fleet-fold" },
    h(P.SectionHeading, {
      title: label,
      count,
      level: 3,
      action: h(P.Tag, { pressable: true, active: open, onClick: onToggle }, open ? "hide" : "show"),
    }),
    open ? children : null,
  );
}

// the panel renders the markdown agents actually write - code spans, bold, links,
// lists, fences and pipe tables; anything else falls through as plain text
const MD_INLINE = /(`+)([^`]+?)\1|\*\*([\s\S]+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function mdInline(text, id) {
  const out = [];
  let last = 0;
  let n = 0;
  let m;
  MD_INLINE.lastIndex = 0;
  while ((m = MD_INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${id}-${n++}`;
    if (m[2] != null) out.push(h("code", { key }, m[2]));
    else if (m[3] != null) out.push(h("b", { key }, m[3]));
    else out.push(h("a", { key, href: m[5], target: "_blank", rel: "noreferrer" }, m[4]));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function mdCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isRule(line) {
  return Boolean(line) && /^[\s|:-]+$/.test(line) && line.includes("-") && line.includes("|");
}

function mdRender(text) {
  const lines = String(text).split("\n");
  const out = [];
  const para = [];
  let i = 0;
  let n = 0;

  const flush = () => {
    if (!para.length) return;
    const key = `p${n++}`;
    out.push(h("p", { key, className: "fleet-md__p" }, mdInline(para.join(" "), key)));
    para.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      flush();
      i += 1;
      continue;
    }

    if (/^\s*```/.test(line)) {
      flush();
      i += 1;
      const body = [];
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++]);
      i += 1;
      out.push(h("pre", { key: `f${n++}`, className: "fleet-md__pre" }, h("code", null, body.join("\n"))));
      continue;
    }

    const head = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (head) {
      flush();
      const key = `h${n++}`;
      out.push(h("div", { key, className: "fleet-md__h" }, mdInline(head[2], key)));
      i += 1;
      continue;
    }

    if (line.includes("|") && isRule(lines[i + 1])) {
      flush();
      const head = mdCells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) rows.push(mdCells(lines[i++]));
      out.push(
        h(
          "div",
          { key: `t${n++}`, className: "fleet-md__scroll" },
          h(
            "table",
            { className: "fleet-md__table" },
            h("thead", null, h("tr", null, head.map((c, x) => h("th", { key: x }, mdInline(c, `th${x}`))))),
            h(
              "tbody",
              null,
              rows.map((r, y) =>
                h("tr", { key: y }, r.map((c, x) => h("td", { key: x }, mdInline(c, `td${y}-${x}`)))),
              ),
            ),
          ),
        ),
      );
      continue;
    }

    const bullet = /^\s*[-*+]\s+/;
    const number = /^\s*\d+[.)]\s+/;
    const marker = bullet.test(line) ? bullet : number.test(line) ? number : null;
    if (marker) {
      flush();
      const items = [];
      while (i < lines.length && marker.test(lines[i])) items.push(lines[i++].replace(marker, ""));
      const key = `l${n++}`;
      out.push(
        h(
          marker === bullet ? "ul" : "ol",
          { key, className: "fleet-md__list" },
          items.map((it, x) => h("li", { key: x }, mdInline(it, `${key}-${x}`))),
        ),
      );
      continue;
    }

    para.push(line);
    i += 1;
  }

  flush();
  return out;
}

function Markdown({ text, className }) {
  const nodes = useMemo(() => mdRender(text ?? ""), [text]);
  return h("div", { className: ["fleet-md", className].filter(Boolean).join(" ") }, nodes);
}

function Conversation({ turns }) {
  return h(
    "div",
    { className: "fleet-used" },
    turns.length
      ? h(
          "div",
          { className: "fleet-talk" },
          turns
            .slice()
            .reverse()
            .map((t, i) =>
              h(
                "div",
                { key: i, className: "fleet-turn", "data-role": t.role },
                h(
                  "div",
                  { className: "fleet-turn__who" },
                  h(Icon, { name: t.role === "you" ? "info" : "done", size: 12 }),
                  h("span", null, t.role),
                  t.at ? h("span", { className: "fleet-turn__at" }, clock(t.at)) : null,
                ),
                h(Markdown, { text: t.text, className: "fleet-turn__text" }),
              ),
            ),
        )
      : h("p", { className: "fleet-used__none" }, "no conversation recorded"),
  );
}

function ToolList({ lines }) {
  return h(
    "div",
    { className: "fleet-used" },
    h(
      "div",
      { className: "fleet-talk" },
      lines.map((l, i) =>
        h(
          "div",
          { key: i, className: "fleet-turn", "data-role": l.cmd ? "tool" : "note" },
          l.cmd
            ? h(
                "div",
                { className: "fleet-turn__who" },
                h(Icon, { name: "terminal", size: 12 }),
                h("span", null, l.cmd.split(/\s{2,}/)[0]),
              )
            : null,
          h("p", { className: "fleet-turn__text" }, l.cmd ? l.cmd.split(/\s{2,}/).slice(1).join(" ") : l.out),
        ),
      ),
    ),
  );
}

function UsedList({ label, items, empty }) {
  return h(
    "div",
    { className: "fleet-used" },
    h(
      "div",
      { className: "pv-label fleet-used__head" },
      h("span", { className: "fleet-used__slash" }, "//"),
      " " + label,
    ),
    items.length
      ? h(
          "div",
          { className: "pv-tags" },
          items.map((it) =>
            h(P.Tag, { key: it.key, count: it.count > 1 ? it.count : undefined }, it.text),
          ),
        )
      : h("p", { className: "fleet-used__none" }, empty),
  );
}

function Activity({ agent, onClose }) {
  const panel = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  if (!agent) return null;
  const finished = Array.isArray(agent.wrote);
  const s = STATUS[agent.status] ?? (finished ? STATUS.done : STATUS.unknown);
  const subs = agent.subagents ?? [];
  const [showTools, setShowTools] = useState(false);
  const [showTalk, setShowTalk] = useState(true);

  const lines = [];
  if (finished) {
    for (const f of agent.wrote) lines.push({ cmd: `Write  ${f}` });
    for (const f of agent.edited) lines.push({ cmd: `Edit   ${f}` });
    if (!lines.length) {
      for (const t of agent.tools) lines.push({ out: `${t.name} x${t.count}`, tone: "dim" });
    }
  } else {
    for (const c of [...(agent.recent ?? [])].reverse()) {
      lines.push({ cmd: c.arg ? `${c.name}  ${c.arg}` : c.name });
    }
  }
  if (!lines.length) lines.push({ out: "no tool calls recorded", tone: "dim" });

  const rows = finished
    ? [
        ["repository", agent.repo ?? "-"],
        ["branch", agent.branch ?? "-"],
        ["cwd", agent.cwd ?? "-"],
        ["model", [model(agent.model), agent.effort].filter(Boolean).join(" · ") || "-"],
        ["wrote", agent.wrote.length ? `${agent.wrote.length} files` : "none via Write"],
        ["edited", agent.edited.length ? `${agent.edited.length} files` : "none via Edit"],
        ["tool calls", `${agent.toolCount} (${agent.bashCount} shell)`],
        ["billed", agent.usage ? `${tokens(agent.usage.total)} tokens` : "-"],
        ["ran for", dur(agent.durationMs) ?? "-"],
        ["ended", agent.endedAt ? `${clock(agent.endedAt)} · ${age(Date.now() - Date.parse(agent.endedAt))} ago` : "-"],
        ["session", agent.sessionId ?? "-"],
        ["prompt", agent.prompt ?? "-"],
      ]
    : [
    ["repository", agent.repo ?? "-"],
    ["branch", agent.branch ?? "-"],
    ["cwd", agent.cwd ?? "-"],
    ["pane", agent.pane ? [agent.workspace, agent.tab, agent.pane].filter(Boolean).join(" / ") : "not in a herdr pane"],
    ["model", [model(agent.model), agent.effort].filter(Boolean).join(" · ") || "-"],
    ["context", agent.contextTokens ? `${tokens(agent.contextTokens)} tokens` : "-"],
    ["status", agent.statusDerived ? `${agent.status} (derived from the transcript)` : `${agent.status} (from herdr)`],
    ["last turn", agent.lastAt ? `${clock(agent.lastAt)} · ${age(agent.idleMs)} ago` : "-"],
    ["session", agent.sessionId ?? "-"],
    ["prompt", agent.prompt ?? "-"],
  ];


  const skills = (agent.skills ?? []).map((x) => ({ key: x.name, text: x.name, count: x.count }));
  const mcps = (agent.mcps ?? []).map((x) => ({
    key: x.server,
    text: `${x.server} \u00b7 ${x.tools.length} ${x.tools.length === 1 ? "tool" : "tools"}`,
    count: x.count,
  }));

  return h(
    "div",
    { className: "fleet-scrim", onClick: onClose },
    h(
      "div",
      {
        className: "fleet-panel",
        role: "dialog",
        "aria-modal": true,
        "aria-label": "Agent activity",
        tabIndex: -1,
        ref: panel,
        "data-accent": s.accent,
        onClick: (e) => e.stopPropagation(),
      },
      h(
        "div",
        { className: "fleet-panel__top" },
        h("span", { className: "fleet-panel__glyph" }, statusIcon(agent.status, 20)),
        h(
          "div",
          { className: "fleet-panel__id" },
          h("div", { className: "pv-label" }, `// ${agent.repo ?? "unknown repository"}`),
          h("h2", null, agent.name ?? agent.title ?? agent.pane),
        ),
        h(
          "button",
          { className: "fleet-x", type: "button", onClick: onClose, "aria-label": "Close" },
          h(Icon, { name: "close", size: 14 }),
        ),
      ),
      h(
        "div",
        { className: "fleet-panel__body" },
        agent.hasReader === false
          ? h(
              P.Callout,
              { tone: "note", title: `${agent.kindLabel ?? agent.kind} is not readable yet`, glyph: h(Icon, { name: "info" }) },
              "Status, pane and workspace come from herdr. Tool calls, conversation, model, context, skills and MCP servers need a reader for this agent's own transcript format, and there is none yet.",
            )
          : null,
        subs.length
          ? h(
              P.Callout,
              { tone: "info", title: `${subs.length} subagents`, glyph: h(Icon, { name: "info" }) },
              subs.map((x) => x.name ?? x.type).join(", "),
            )
          : null,
        h(
          Fold,
          {
            label: "conversation",
            count: (agent.turns ?? []).length,
            open: showTalk,
            onToggle: () => setShowTalk((v) => !v),
          },
          h(Conversation, { turns: agent.turns ?? [] }),
        ),
        h(
          Fold,
          {
            label: finished ? "produced" : "tool calls",
            count: finished ? agent.wrote.length + agent.edited.length : agent.recent?.length ?? 0,
            open: showTools,
            onToggle: () => setShowTools((v) => !v),
          },
          h(ToolList, { lines }),
        ),
        h(UsedList, { label: "skills used", items: skills, empty: "No skills invoked in this session" }),
        h(UsedList, { label: "mcp servers used", items: mcps, empty: "No MCPs called in this session" }),
        h(
          "dl",
          { className: "fleet-kv" },
          ...rows.flatMap(([k, v]) => [h("dt", { key: `${k}-k` }, k), h("dd", { key: `${k}-v` }, v)]),
        ),
      ),
    ),
  );
}

function App() {
  const [fleet, state] = useFleet();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [repo, setRepo] = useState("all");
  const [open, setOpen] = useState(null);
  const [showClosed, setShowClosed] = useState(false);
  const [showStale, setShowStale] = useState(false);

  const agents = fleet?.agents ?? [];
  const close = useCallback(() => setOpen(null), []);

  const repos = useMemo(
    () => [...new Set(agents.map((a) => a.repo).filter(Boolean))].sort(),
    [agents],
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return agents.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (repo !== "all" && a.repo !== repo) return false;
      if (!needle) return true;
      return [a.name, a.title, a.repo, a.branch, a.tool?.name, a.tool?.arg, a.prompt]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [agents, q, status, repo]);

  const columns = ORDER.filter((k) => k !== "stale")
    .map((k) => [k, shown.filter((a) => a.status === k)])
    .filter(([k, list]) => !OPTIONAL.has(k) || list.length);

  const staleShown = shown.filter((a) => a.status === "stale");

  const closed = fleet?.closed ?? [];
  const closedShown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return closed.filter((c) => {
      if (repo !== "all" && c.repo !== repo) return false;
      if (!needle) return true;
      return [c.title, c.repo, c.branch, c.prompt, ...c.wrote, ...c.edited]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [closed, q, repo]);

  const counts = fleet?.counts ?? {};
  const ctxTotal = agents.reduce((n, a) => n + (a.contextTokens ?? 0), 0);
  const totals = fleet?.totals ?? {};
  const opened = agents.find((a) => a.id === open) ?? closed.find((c) => c.id === open) ?? null;

  return h(
    React.Fragment,
    null,

    h(P.SiteHeader, {
      name: "agents",
      suffix: "fleet",
      initials: "AF",
      sticky: true,
      homeHref: "/",
    }),

    h(
      "header",
      { className: "fleet-hero" },
      h(
        "div",
        { className: "fleet-hero__field", "aria-hidden": true },
        h(P.Contours, {
          variant: "topo",
          scale: 0.08,
          cell: 11,
          levels: 10,
          interactive: true,
          ripple: true,
          mask: "bottom",
          opacity: 0.4,
          seed: 12,
        }),
      ),
      h(
        "div",
        { className: "fleet-in fleet-hero__in" },
        h(
          "div",
          { className: "pv-stats" },
          h(P.Stat, { value: counts.blocked ?? 0, label: "blocked", hint: "waiting on you", accent: "yellow" }),
          h(P.Stat, { value: counts.working ?? 0, label: "working", hint: "running now", accent: "blue" }),
          h(P.Stat, {
            value: (counts.idle ?? 0) + (counts.done ?? 0),
            label: "quiet",
            hint: "idle or finished",
            accent: "green",
          }),
          h(P.Stat, {
            value: tokens(ctxTotal) ?? "0",
            label: "context",
            hint: "tokens in flight",
            accent: "sapphire",
          }),
          h(P.Stat, {
            value: tokens(totals.total ?? 0) ?? "0",
            label: "tokens",
            hint: "billed, all sessions",
            accent: "teal",
          }),
        ),
      ),
    ),

    h(
      "main",
      { className: "fleet-in fleet-main" },

      state === "down"
        ? h(
            P.Callout,
            { tone: "danger", title: "Not receiving updates", glyph: h(Icon, { name: "alert" }) },
            "The fleet server is not answering. Retrying every 2 seconds.",
          )
        : null,

      fleet && !fleet.herdr.available
        ? h(
            P.Callout,
            { tone: "note", title: "Running without herdr", glyph: h(Icon, { name: "info" }) },
            `${fleet.herdr.reason}. Sessions come from transcripts active in the last ${fleet.windowMin} minutes, and status is derived rather than reported - an agent waiting on an approval prompt cannot be told apart from one that is idle.`,
          )
        : null,

      h(
        "section",
        { className: "fleet-block" },
        h(P.SectionHeading, { title: "agents", count: shown.length, level: 2 }),
        h(
          "div",
          { className: "fleet-bar" },
          h(
            "div",
            { className: "fleet-bar__grow" },
            h(P.SearchField, {
              value: q,
              onChange: setQ,
              label: "Filter",
              placeholder: "Name, title, tool, branch",
              prompt: h(Icon, { name: "prompt", size: 12 }),
            }),
          ),
          h(P.Dropdown, {
            label: "Status",
            select: true,
            value: status,
            onChange: setStatus,
            items: [
              { label: "All Status", value: "all" },
              ...ORDER.filter((k) => counts[k]).map((k) => ({
                label: h("span", { className: "fleet-opt" }, statusIcon(k), title(k)),
                value: k,
                meta: String(counts[k]),
              })),
            ],
          }),
          repos.length > 1
            ? h(P.Dropdown, {
                label: "Repository",
                select: true,
                value: repo,
                onChange: setRepo,
                items: [
                  { label: "All Repositories", value: "all" },
                  ...repos.map((r) => ({ label: r, value: r })),
                ],
              })
            : null,
        ),

        h(
          "div",
          { className: "fleet-board" },
          columns.map(([key, list], i) =>
            h(
              "section",
              {
                key,
                className: "fleet-col",
                "data-accent": STATUS[key].accent,
                "data-reveal": i < 4 ? String(i + 1) : undefined,
                "aria-label": `${key}, ${list.length} agents`,
              },
              h(
                "div",
                { className: "fleet-col__head" },
                h("span", { className: "fleet-col__glyph" }, statusIcon(key)),
                h("span", { className: "fleet-col__name" }, key),
                h("span", { className: "fleet-col__count" }, list.length),
              ),
              h(
                "div",
                { className: "fleet-col__body" },
                list.length
                  ? list.map((a) => h(AgentCard, { key: a.id, agent: a, onOpen: setOpen }))
                  : h("p", { className: "fleet-col__none" }, `nothing ${key}`),
              ),
            ),
          ),
        ),
      ),
    ),

    h(
      "section",
      { className: "fleet-in fleet-block fleet-stale", "data-accent": STATUS.stale.accent },
      h(P.SectionHeading, {
        title: "stale agents",
        count: staleShown.length,
        level: 2,
        action: h(
          P.Tag,
          { pressable: true, active: showStale, onClick: () => setShowStale((v) => !v) },
          showStale ? "hide" : "show",
        ),
      }),
      showStale
        ? staleShown.length
          ? h(
              "div",
              { className: "fleet-board" },
              staleShown.map((a) => h(AgentCard, { key: a.id, agent: a, onOpen: setOpen })),
            )
          : h("p", { className: "fleet-used__none" }, "nothing stale")
        : h("p", { className: "fleet-used__none" }, `${staleShown.length} agents with no herdr pane`),
    ),

    h(
      "section",
      { className: "fleet-in fleet-block fleet-finished", "data-accent": "peach" },
      h(P.SectionHeading, {
        title: "finished agents",
        count: closedShown.length,
        level: 2,
        action: h(
          P.Tag,
          { pressable: true, active: showClosed, onClick: () => setShowClosed((v) => !v) },
          showClosed ? "hide" : "show",
        ),
      }),
      showClosed
        ? closedShown.length
          ? h(
              "div",
              { className: "fleet-board" },
              closedShown.map((c) => h(ClosedCard, { key: c.id, agent: c, onOpen: setOpen })),
            )
          : h("p", { className: "fleet-used__none" }, "nothing finished in this window")
        : h(
            "p",
            { className: "fleet-used__none" },
            `${closedShown.length} agents finished in the last ${Math.round((fleet?.closedWindowMin ?? 1440) / 60)}h`,
          ),
    ),

    h(P.SiteFooter, {
      className: "fleet-foot",
      pattern: true,
      patternVariant: "ridge",
      copyright: h(
        React.Fragment,
        null,
        "2026 Volodymyr Pivoshenko <",
        h("a", { className: "pv-footer__email", href: "mailto:contact@pivoshenko.dev" }, "contact@pivoshenko.dev"),
        ">",
      ),
    }),

    h(P.BackToTop, { accent: "blue", glyph: h(Icon, { name: "top", size: 14 }) }),

    opened ? h(Activity, { agent: opened, onClose: close }) : null,
  );
}

window.__AgentCard = AgentCard;
window.__ClosedCard = ClosedCard;
window.__Activity = Activity;

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
