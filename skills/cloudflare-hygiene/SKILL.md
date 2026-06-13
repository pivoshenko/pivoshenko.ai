---
name: cloudflare-hygiene
description: Audit + harden + optimize live Cloudflare zones/domains — read-only sweep of each zone (SSL/TLS mode, HSTS, min TLS, TLS 1.3, Always-Use-HTTPS, Brotli, HTTP/3, 0-RTT, Early Hints, caching, security level, Bot Fight Mode, WAF, DNS proxy/TTL + SPF/DKIM/DMARC hygiene, DNSSEC) → ok/attention/action report grouped by category → per-category confirm → apply via Cloudflare MCP. Use when the user says "harden my cloudflare", "optimize my cloudflare zones", "audit my domains", "check my cloudflare settings", "secure my dns", "harden my dns", "hide my origin IP", "set up HSTS/DNSSEC", "am I leaking my origin", "is my cloudflare config optimal", or "tune cloudflare". For BUILDING on Cloudflare (Workers/Pages/KV/D1/Terraform) use the cloudflare skill instead.
tags: [cloudflare, optimization, security]
updated_at: 2026-06-13
---

# Cloudflare Hygiene

Periodic posture sweep over live zones: preflight → sweep (read-only) → report → confirm → apply → verify. Optimization = real wins only: TLS strict, HTTPS forced, modern protocols on, DNS proxied + mail auth complete. No theater (no settings churned that already match optimal, no proxying records that must stay direct). Building on Cloudflare (Workers/Pages/KV/D1) → `cloudflare`, hand off.

## Preflight

1. Token scope — this skill mutates zone settings + DNS, needs a **broad-scope token**. Probe once: `GET /zones/{id}/settings/ssl`. 9109/10000 (Unauthorized) → token too narrow, STOP and surface the upgrade path (see Token setup below) before sweeping. Don't limp through a settings-blind run.
2. Enumerate zones — `GET /zones` (paginate). List name · id · plan. Warn: full sweep across N zones takes a moment.
3. All work goes through `mcp__cloudflare-api__execute` (REST). `mcp__cloudflare-api__docs` / `search` for endpoint/shape lookups. `mcp__cloudflare__authenticate` = OAuth fallback if no API token configured.

## Sweep (read-only)

Per zone, every category below — each shows in the report, clean ones as "ok", never silently dropped. GETs only here; no mutation. Full endpoint + optimal-value matrix lives in `references/best-practices.md`; `scripts/audit.mjs` is the reference read-only sweep logic (GETs + verdict classifier).

1. **SSL/TLS** — `settings/ssl` (want `strict`); `settings/always_use_https` (on); `settings/min_tls_version` (≥1.2); `settings/tls_1_3` (on); `settings/automatic_https_rewrites` (on); `settings/security_header` HSTS (enabled, max-age ≥6mo, includeSubDomains; **preload = opt-in only**).
2. **Security / WAF / bot** — `rulesets` phases (`http_request_firewall_managed` deployed? `ddos_l7` present?); `settings/security_level` (medium); `bot_management` (Bot Fight Mode on — Free tier); `settings/email_obfuscation` (on); `settings/browser_check` (on); custom firewall ruleset (`http_request_firewall_custom` — any bespoke rules?); **rate limiting** ruleset (`http_ratelimit` phase — login/API endpoints protected?); **IP access rules / Zone Lockdown** (`firewall/access_rules/rules` — stale allowlists?); **Page Shield** (`page_shield` — client-side/Magecart, plan-gated); **Authenticated Origin Pulls** (`settings/tls_client_auth` — mTLS edge→origin so origin only trusts CF); **Leaked Credential Check** (`leaked-credential-checks` — alerts on breached creds, plan-gated). Under Attack mode = situational (incident only), never default-on.
3. **Performance / caching** — `settings/brotli` (on); `settings/early_hints` (on); `settings/cache_level` (aggressive/standard); `settings/browser_cache_ttl`; `settings/rocket_loader` (**case-by-case — can break JS, report don't force**).
4. **Network protocols** — `settings/http3` (on); `settings/0rtt` (on, idempotent-GET caveat); `settings/ipv6` (on); `settings/websockets` (on); HTTP/2 (on).
5. **DNS hygiene** — `dns_records`: proxiable A/AAAA/CNAME should be **proxied (orange)** unless intentionally direct (flag grey-cloud = origin exposed); `dnssec` (active); parse TXT for **SPF** (root `v=spf1`), **DKIM** (`*._domainkey`), **DMARC** (`_dmarc.<zone>` — flag missing as action); dangling CNAMEs → takeover risk; low TTLs on stable records.
6. **Analytics / observability** — **Web Analytics** (`/accounts/{acct}/rum/site_info/list` — privacy-first, free; enabled for this zone?); **Security Events** summary (GraphQL `firewallEventsAdaptive` — last 24h threats blocked, top rules/countries → posture context, not a setting); **Logpush** (`logpush/jobs` — paid/Enterprise, report gap only). Pull the security-events summary read-only so the report shows what the WAF is actually catching, not just whether it's on.

## Report

Table per zone × category: check · current · optimal · verdict (`ok` / `attention` = watch / `action` = fix available, named). Lead per zone: "Zone X: N ok, N attention, N actions". Then `AskUserQuestion` multiSelect over the actions only. Anything that can break traffic gets its own option, side effects stated first.

## Actions (each confirmed, side effects stated first)

- **SSL mode → Full (strict)**: `PATCH settings/ssl {value:"strict"}` — **breaks if origin lacks a valid cert.** Confirm origin has a cert (Cloudflare Origin CA or real CA) before flipping.
- **Always Use HTTPS / Auto HTTPS Rewrites / min TLS 1.2 / TLS 1.3 on**: `PATCH` each — low risk; min-TLS bump can lock out ancient clients, name it.
- **HSTS**: `PATCH settings/security_header {value:{strict_transport_security:{enabled,max_age,include_subdomains}}}` (single-setting body wraps in `value`; `nosniff` also available). **Hard to undo — browsers cache it; preload is near-permanent.** Default no preload unless user explicitly opts in.
- **Brotli / Early Hints / HTTP/3 / 0-RTT / IPv6 / WebSockets on**: `PATCH settings/{id} {value:"on"}` each — safe, idempotent.
- **email obfuscation / browser check on**: `PATCH settings/{id} {value:"on"}` — safe.
- **Bot Fight Mode on**: `PUT bot_management {fight_mode:true}` (whole-object PUT, not a setting PATCH) — safe; can challenge some automation.
- **Rate limiting rule**: `PUT rulesets/phases/http_ratelimit/entrypoint` — protect login/API/expensive endpoints. **Set thresholds from real traffic (use the analytics summary) — too tight = legit 429s.** Confirm the matched path + threshold.
- **Authenticated Origin Pulls**: `PATCH settings/tls_client_auth {value:"on"}` — **origin must be configured to require the CF client cert first, else all traffic 502s.** Two-step, origin-side change owned by user.
- **Page Shield**: `PUT page_shield {enabled:true}` — **plan-gated** (Pro+); if Free errors, report the gap, don't churn.
- **Leaked Credential Check**: `POST leaked-credential-checks {enabled:true}` — **plan-gated**; same fallback.
- **Prune stale IP access rules**: `DELETE firewall/access_rules/rules/{id}` — confirm each; an old allow-rule can be a bypass hole.
- **Enable Web Analytics**: `POST /accounts/{acct}/rum/site_info` for the zone — free, privacy-first, no cookie banner; gives RUM without GA. Safe.
- **Enable DNSSEC**: `PATCH dnssec {status:"active"}` → returns DS record; **incomplete until user adds the DS record at the registrar** — give them the DS values, it's a two-step.
- **Proxy a grey-cloud record**: `PATCH dns_records/{id} {proxied:true}` — **never proxy mail (MX/its A), verification, or services needing direct origin.** Confirm per record.
- **Add DMARC**: propose `_dmarc.<zone>` TXT (start `v=DMARC1; p=none; rua=mailto:...` for monitoring), confirm value, `POST dns_records`.

## Token setup (when preflight fails)

Narrow token → either (a) mint a scoped API token: dashboard → My Profile → API Tokens → Zone.Settings:Edit + DNS:Edit + Zone:Read (+ Bot Management, SSL/TLS where plan allows) for the target zones, then wire it into the `cloudflare-api` MCP env; or (b) `mcp__cloudflare__authenticate` OAuth flow if available. Re-run preflight after.

## Rules

- Sweep = read-only. Change state only via confirmed actions, one at a time → verify (re-GET, confirm new value) → next.
- Side effects before confirm, always: SSL-mode origin break, min-TLS client lockout, HSTS/preload permanence, DNSSEC two-step, proxying a direct-only record.
- No churn: a setting already at optimal is `ok`, not an action — don't PATCH it to look busy. Clean zone → "posture optimal", stop.
- Report-only is valid — fixing is optional, never assumed.
- Free-plan limits: some managed-WAF rules, Bot Management depth, and Page Rules count are plan-gated — report the gap, don't pretend it's fixable on Free.
- Boundaries: Workers/Pages/KV/D1/R2/Terraform → `cloudflare`; registrar-side DNS, origin-server config, email DNS *content* policy → out of scope, name it.
