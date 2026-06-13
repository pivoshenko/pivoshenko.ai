# Cloudflare zone best-practices checklist

Full reference for `cloudflare-harden`. Each item: **optimal value · why · endpoint (auto) / dashboard path (manual) · risk**. All endpoints are zone-scoped: `/zones/{zone_id}/...`. Reads = `GET`, applies = `PATCH` (settings) / `POST` (new DNS records) via `mcp__cloudflare-api__execute`.

Verdicts in the report: `ok` (matches optimal) · `attention` (suboptimal, low urgency or judgment call) · `action` (fixable now, named).

---

## A. SSL/TLS

| Check | Optimal | Why | Endpoint | Risk |
| --- | --- | --- | --- | --- |
| SSL mode | `strict` (Full strict) | Flexible/Full allow unauthenticated or cleartext origin legs (MITM). | `settings/ssl` | **Breaks if origin has no valid cert.** Verify origin cert (Origin CA / real CA) first. |
| Always Use HTTPS | `on` | Redirects all HTTP→HTTPS at edge. | `settings/always_use_https` | Low. |
| Automatic HTTPS Rewrites | `on` | Rewrites mixed-content subresource URLs to HTTPS. | `settings/automatic_https_rewrites` | Low. |
| Opportunistic Encryption | `on` | Lets HTTP/1 clients negotiate encryption. | `settings/opportunistic_encryption` | Low. |
| Min TLS version | `1.2` (`1.3` if no legacy clients) | <1.2 is deprecated/insecure. | `settings/min_tls_version` | Bump can lock out ancient clients. |
| TLS 1.3 | `on` | Faster handshake, modern ciphers. | `settings/tls_1_3` | Low. |
| HSTS | enabled, `max_age` ≥ 15552000 (6mo), `include_subdomains` on | Forces HTTPS in-browser, blocks SSL-strip. | `settings/security_header` → `strict_transport_security` | **Hard to undo (browser-cached). Preload near-permanent — opt-in only.** |

## B. Security / WAF / bot

| Check | Optimal | Why | Endpoint | Risk |
| --- | --- | --- | --- | --- |
| Managed WAF | deployed in `http_request_firewall_managed` phase | Blocks known exploit patterns. | `rulesets` (read), `rulesets/phases/...` (edit) | Free plan = limited rule set; report the gap. |
| Security Level | `medium` | Balanced challenge threshold for suspicious IPs. | `settings/security_level` | High/UAM can challenge legit users. |
| Bot Fight Mode | `on` | Free-tier bot mitigation. | `bot_management` (PUT `{fight_mode:true}` — whole-object, not a setting PATCH) | Can challenge some automation; name it. |
| Email Obfuscation | `on` | Hides mailto from scrapers. | `settings/email_obfuscation` | Low. |
| Browser Integrity Check | `on` | Blocks requests with bad/missing headers. | `settings/browser_check` | Low. |
| Hotlink Protection | per-case | Stops bandwidth theft of images. | `settings/hotlink_protection` | Can break legit cross-origin embeds — judgment. |
| DDoS L7 | managed `ddos_l7` ruleset present + sensitivity sane | Auto L7 attack mitigation. | `rulesets` (phase `ddos_l7`) | On by default; only override sensitivity per-case. |
| Custom firewall rules | bespoke rules for known-bad patterns | App-specific blocks (paths, geos, ASNs). | `rulesets/phases/http_request_firewall_custom` | Over-broad rule blocks legit users — scope tightly. |
| Rate limiting | login/API/expensive endpoints capped | Stops credential-stuffing, scraping, abuse. | `rulesets/phases/http_ratelimit/entrypoint` (PUT) | **Threshold from real traffic — too tight = legit 429s.** Free plan = 1 rule. |
| IP Access Rules / Zone Lockdown | no stale allowlists | Old allow-rule = bypass hole. | `firewall/access_rules/rules` (legacy — not deprecated, but author *new* blocks in WAF custom rules) | Confirm before deleting an allow you forgot the reason for. |
| Authenticated Origin Pulls | `on` (+ origin requires CF cert) | Origin trusts only Cloudflare → blocks direct-origin attacks. | `settings/tls_client_auth` | **Origin must require the client cert first, else 502s. Two-step.** |
| Page Shield | enabled | Detects rogue client-side scripts (Magecart/skimmers). | `page_shield` (PUT `{enabled:true}`) | **Plan-gated** (Pro+). |
| Leaked Credential Check | enabled | Flags requests using breached credentials. | `leaked-credential-checks` (POST `{enabled:true}`) | **Plan-gated.** |
| Under Attack mode | **off (situational)** | JS challenge for everyone — incident-only. | `settings/security_level=under_attack` | **Never default-on — challenges all legit users.** |

## C. Performance / caching

| Check | Optimal | Why | Endpoint | Risk |
| --- | --- | --- | --- | --- |
| Brotli | `on` | Better compression than gzip. | `settings/brotli` | Low. |
| Early Hints | `on` | 103 hints → faster LCP. | `settings/early_hints` | Low. |
| Caching Level | `aggressive` (standard) | Caches static assets at edge. | `settings/cache_level` | Query-string-sensitive apps — check. |
| Browser Cache TTL | respect origin or ≥ 4h | Fewer revalidations. | `settings/browser_cache_ttl` | Stale assets if origin lacks versioning. |
| Always Online | `on` | Serves cached copy when origin down. | `settings/always_online` | Low. |
| Rocket Loader | **case-by-case (default off)** | Defers JS — can break scripts. | `settings/rocket_loader` | **Can break JS — report, don't force.** |

## D. Network protocols

| Check | Optimal | Why | Endpoint | Risk |
| --- | --- | --- | --- | --- |
| HTTP/3 (QUIC) | `on` | Lower latency, head-of-line-blocking-free. | `settings/http3` | Low. |
| HTTP/2 | `on` | Multiplexing. | (auto with proxy) | Low. |
| 0-RTT | `on` | Resumed-connection speedup. | `settings/0rtt` | Replay risk on non-idempotent GETs — generally fine. |
| IPv6 Compatibility | `on` | Dual-stack reach. | `settings/ipv6` | Low. |
| WebSockets | `on` | Needed for WS apps. | `settings/websockets` | Low. |

## E. DNS hygiene

| Check | Optimal | Why | Action | Risk |
| --- | --- | --- | --- | --- |
| Proxy status | proxiable A/AAAA/CNAME = **proxied (orange)** | Grey-cloud exposes origin IP/host → bypass WAF/DDoS. | `PATCH dns_records/{id} {proxied:true}` | **Never proxy mail (MX + its target), verification, or direct-only services.** Per-record confirm. |
| DNSSEC | `active` + DS at registrar | Prevents DNS spoofing. | `PATCH dnssec {status:"active"}` → DS record | **Two-step: incomplete until DS added at registrar.** |
| SPF | root TXT `v=spf1 ... -all` | Authorizes senders, anti-spoof. | propose + `POST dns_records` | Wrong SPF can drop legit mail — confirm content. |
| DKIM | `*._domainkey` TXT present | Signs outbound mail. | report (provider-generated) | Content owned by mail provider. |
| DMARC | `_dmarc.<zone>` TXT `v=DMARC1; p=...` | Ties SPF/DKIM together, reporting. | propose `p=none` (monitor) + `POST` | Start at `p=none`, tighten later. |
| Dangling CNAME | none pointing to decommissioned hosts | Subdomain takeover risk. | report → per-record confirm delete | Confirm truly unused first. |
| TTLs | auto (`1`) or sane | Faster failover / propagation. | report only | Low. |

## F. Analytics / observability

| Check | Optimal | Why | Endpoint | Risk |
| --- | --- | --- | --- | --- |
| Web Analytics | enabled | Free, privacy-first RUM (Core Web Vitals, no cookie banner, no GA). | `POST /accounts/{acct}/rum/site_info` (read: `.../rum/site_info/list`) | Account-scoped, not zone-scoped — needs Account.Analytics. |
| Security Events | reviewed (last 24h) | Shows what the WAF actually blocks — top rules, paths, countries, ASNs. Tunes rate-limit + custom rules. | GraphQL `firewallEventsAdaptive` (`/graphql`) | Read-only; posture context, not a setting. Free plan = limited retention. |
| HTTP/traffic analytics | reviewed | Cache hit ratio, bandwidth, status mix → caching + perf tuning feedback. | GraphQL `httpRequests1dGroups` | Read-only. |
| Logpush | enabled (if available) | Stream logs to S3/R2/SIEM for retention + alerting. | `logpush/jobs` | **Enterprise-gated** — report gap on lower plans. |

Analytics is mostly **read-to-inform**: pull the security-events + traffic summary during the sweep so the report shows real behavior (what's blocked, cache ratio) — that data drives the rate-limit thresholds and custom-rule decisions above. The only *apply* here is enabling Web Analytics.

> The GraphQL dataset/field names (`firewallEventsAdaptive`, `httpRequests1dGroups`, and projections like `ruleId`/`source`) live on the `/graphql` endpoint, which the REST OpenAPI spec doesn't cover — confirm them against the live GraphQL schema before relying on them.

GraphQL summary query shape (last 24h firewall events):

```graphql
query ($zone: String!, $since: Time!) {
  viewer { zones(filter: {zoneTag: $zone}) {
    firewallEventsAdaptive(limit: 100, filter: {datetime_geq: $since}) {
      action source clientCountryName clientRequestPath ruleId
    }
  }}
}
```

---

## Auto vs manual matrix

"Auto" = applyable via `mcp__cloudflare-api__execute` **given a broad-scope token** (Zone.Settings:Edit + DNS:Edit + Zone:Read, plus Bot Management / SSL where the plan allows). With a narrow token the entire `settings/*`, `dnssec`, and `bot_management` surface returns 9109/10000 and must be done in the dashboard — preflight catches this.

- **Auto (broad token):** all `settings/*` (A–D), `bot_management`, custom/rate-limit `rulesets`, `firewall/access_rules`, `dnssec` enable, all `dns_records` reads/edits (E), Web Analytics enable + all analytics reads (F).
- **Always manual (off-platform):** registrar-side DS record (DNSSEC step 2), origin-server cert install + Authenticated-Origin-Pulls origin config, mail provider DKIM generation.
- **Plan-gated:** managed-WAF rule depth + Bot Management beyond Fight Mode + Page Rules count (Free); Page Shield + Leaked Credential Check (Pro+); Logpush (Enterprise) — report the gap, don't pretend.

## Dashboard paths (manual fallback)

- SSL/TLS: **SSL/TLS → Overview / Edge Certificates** (mode, Always-HTTPS, min-TLS, TLS 1.3, HSTS, Auto Rewrites).
- Security: **Security → Settings / WAF / Bots / Page Shield** (security level, Bot Fight Mode, managed + custom rules, rate limiting, IP access rules, Page Shield, Authenticated Origin Pulls under SSL/TLS → Origin Server).
- Analytics: **Analytics & Logs → Web Analytics / Security / Traffic**; **Logs → Logpush** (Enterprise).
- Performance: **Speed → Optimization** (Brotli, Early Hints, Rocket Loader); **Caching → Configuration** (cache level, browser TTL, Always Online).
- Network: **Network** (HTTP/3, 0-RTT, IPv6, WebSockets).
- DNS: **DNS → Records** (proxy toggle, TXT records); **DNS → Settings** (DNSSEC).
