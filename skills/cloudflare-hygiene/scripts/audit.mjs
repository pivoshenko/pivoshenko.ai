#!/usr/bin/env node
// Read-only Cloudflare zone audit — reference sweep logic for `cloudflare-hygiene`.
// GETs only. NO mutation here; all PATCH/POST live in the confirmed-apply phase.
//
// Run directly with a token in env:  CLOUDFLARE_API_TOKEN=... node scripts/audit.mjs
// Or feed this logic to `mcp__cloudflare-api__execute` (same endpoints) when driving via MCP.

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
if (!TOKEN) {
  console.error("set CLOUDFLARE_API_TOKEN (Zone:Read + Zone.Settings:Read + DNS:Read)");
  process.exit(1);
}

const API = "https://api.cloudflare.com/client/v4";
const H = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

async function cf(path) {
  const r = await fetch(`${API}${path}`, { headers: H });
  const j = await r.json();
  if (!j.success) return { _err: j.errors?.[0]?.code ?? r.status, _msg: j.errors?.[0]?.message };
  return j.result;
}

// paginated GET — follows result_info.total_pages so large accounts/zones aren't truncated
async function cfAll(path, perPage = 100) {
  const sep = path.includes("?") ? "&" : "?";
  const out = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`${API}${path}${sep}per_page=${perPage}&page=${page}`, { headers: H });
    const j = await r.json();
    if (!j.success) return { _err: j.errors?.[0]?.code ?? r.status, _msg: j.errors?.[0]?.message };
    out.push(...j.result);
    if (!j.result_info || page >= j.result_info.total_pages) break;
  }
  return out;
}

const isAuthErr = (e) => e === 9109 || e === 10000;

// optimal values per setting id (settings/* surface)
const OPTIMAL = {
  ssl: "strict",
  always_use_https: "on",
  automatic_https_rewrites: "on",
  min_tls_version: "1.2",
  tls_1_3: "on",
  brotli: "on",
  early_hints: "on",
  http3: "on",
  "0rtt": "on",
  ipv6: "on",
  websockets: "on",
  email_obfuscation: "on",
  browser_check: "on",
  always_online: "on",
};
const SETTINGS = Object.keys(OPTIMAL);

const verdict = (cur, opt) =>
  cur === undefined ? "manual" : cur === opt ? "ok" : "action";

async function auditZone(z) {
  const rows = [];

  // A–D: settings/*  (broad token required; narrow token -> _err -> mark manual)
  for (const id of SETTINGS) {
    const s = await cf(`/zones/${z.id}/settings/${id}`);
    const cur = s?._err ? undefined : s.value;
    rows.push({ cat: "settings", check: id, current: cur ?? `blocked(${s._err})`, optimal: OPTIMAL[id], verdict: verdict(cur, OPTIMAL[id]) });
  }

  // HSTS (nested under security_header)
  const sh = await cf(`/zones/${z.id}/settings/security_header`);
  const hsts = sh?._err ? undefined : sh.value?.strict_transport_security;
  rows.push({ cat: "settings", check: "hsts", current: hsts ? (hsts.enabled ? `on(max_age=${hsts.max_age})` : "off") : `blocked`, optimal: "on,max_age>=15552000", verdict: hsts?.enabled ? "ok" : hsts ? "action" : "manual" });

  // B: security level + bot
  const sl = await cf(`/zones/${z.id}/settings/security_level`);
  rows.push({ cat: "security", check: "security_level", current: sl?._err ? `blocked(${sl._err})` : sl.value, optimal: "medium", verdict: sl?._err ? "manual" : sl.value === "medium" ? "ok" : "attention" });
  const bm = await cf(`/zones/${z.id}/bot_management`);
  rows.push({ cat: "security", check: "bot_fight_mode", current: bm?._err ? `blocked(${bm._err})` : (bm.fight_mode ?? bm.enable_js ?? "n/a"), optimal: "on", verdict: bm?._err ? "manual" : (bm.fight_mode ? "ok" : "action") });

  // B: managed WAF deployed? (auth err -> manual; 404/empty -> action; rules -> ok)
  const fw = await cf(`/zones/${z.id}/rulesets/phases/http_request_firewall_managed/entrypoint`);
  rows.push({ cat: "security", check: "managed_waf", current: fw?._err ? (isAuthErr(fw._err) ? `blocked(${fw._err})` : "not deployed") : `${fw.rules?.length ?? 0} rules`, optimal: "deployed", verdict: fw?._err ? (isAuthErr(fw._err) ? "manual" : "action") : (fw.rules?.length ? "ok" : "action") });

  // E: DNS hygiene
  const recs = await cfAll(`/zones/${z.id}/dns_records`, 500);
  if (!recs?._err) {
    const proxiable = recs.filter((r) => r.proxiable);
    const grey = proxiable.filter((r) => !r.proxied);
    rows.push({ cat: "dns", check: "proxy_status", current: `${proxiable.length - grey.length}/${proxiable.length} proxied`, optimal: "all proxiable proxied", verdict: grey.length ? "attention" : "ok", detail: grey.map((r) => `${r.type} ${r.name}`) });

    const txt = recs.filter((r) => r.type === "TXT");
    const has = (re) => txt.some((r) => re.test(r.content));
    rows.push({ cat: "dns", check: "spf", current: has(/v=spf1/i) ? "present" : "missing", optimal: "present", verdict: has(/v=spf1/i) ? "ok" : "attention" });
    rows.push({ cat: "dns", check: "dkim", current: recs.some((r) => /_domainkey/.test(r.name)) ? "present" : "missing", optimal: "present", verdict: recs.some((r) => /_domainkey/.test(r.name)) ? "ok" : "attention" });
    rows.push({ cat: "dns", check: "dmarc", current: recs.some((r) => /^_dmarc\./.test(r.name)) ? "present" : "missing", optimal: "present", verdict: recs.some((r) => /^_dmarc\./.test(r.name)) ? "ok" : "action" });
  } else {
    rows.push({ cat: "dns", check: "records", current: `blocked(${recs._err})`, optimal: "-", verdict: "manual" });
  }

  // E: DNSSEC
  const ds = await cf(`/zones/${z.id}/dnssec`);
  rows.push({ cat: "dns", check: "dnssec", current: ds?._err ? `blocked(${ds._err})` : ds.status, optimal: "active", verdict: ds?._err ? "manual" : ds.status === "active" ? "ok" : "action" });

  return rows;
}

const zones = await cfAll("/zones", 50);
if (zones?._err) { console.error("zones read failed:", zones._err, zones._msg); process.exit(1); }

for (const z of zones) {
  console.log(`\n=== ${z.name} (${z.plan?.name ?? "?"}) ===`);
  const rows = await auditZone(z);
  const n = (v) => rows.filter((r) => r.verdict === v).length;
  console.log(`ok:${n("ok")} attention:${n("attention")} action:${n("action")} manual:${n("manual")}`);
  for (const r of rows) {
    const d = r.detail?.length ? `  [${r.detail.join(", ")}]` : "";
    console.log(`  ${r.verdict.padEnd(9)} ${r.cat}/${r.check}: ${r.current} (want ${r.optimal})${d}`);
  }
}
