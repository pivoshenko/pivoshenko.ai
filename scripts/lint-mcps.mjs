#!/usr/bin/env node
// Validates mcps/. Each file is a bare {"mcpServers": {...}} block with secrets
// as Kasetto placeholders, never literals. Note the asymmetry the linter warns
// about: the site lists every file here, Kasetto only syncs the ones named in
// kasetto.yaml, so a file missing from the config ships to nobody

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createReport, kasettoMcpNames } from './lib.mjs'

const ROOT = process.cwd()
const report = createReport('mcps')
const configured = kasettoMcpNames(ROOT)
let count = 0

// Shapes that mean a real credential got committed instead of a placeholder
const SECRETS = [
  [/ghp_[A-Za-z0-9]{16,}/, 'GitHub personal access token'],
  [/github_pat_[A-Za-z0-9_]{20,}/, 'GitHub fine-grained token'],
  [/\bsk-[A-Za-z0-9-]{20,}/, 'API secret key'],
  [/\bxox[abposr]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./, 'JWT'],
]

for (const entry of readdirSync(join(ROOT, 'mcps')).sort()) {
  if (entry.startsWith('.')) continue
  const rel = `mcps/${entry}`
  report.file(rel)

  if (!entry.endsWith('.json')) {
    report.err('stray file, every entry must be a .json server definition')
    continue
  }

  count++
  const stem = entry.replace(/\.json$/, '')
  const raw = readFileSync(join(ROOT, 'mcps', entry), 'utf8')

  let doc
  try {
    doc = JSON.parse(raw)
  } catch (e) {
    report.err(`invalid JSON: ${e.message}`)
    continue
  }

  const top = Object.keys(doc)
  if (top.length !== 1 || top[0] !== 'mcpServers') {
    report.err(`top level is {${top.join(', ')}}, want a bare {"mcpServers": ...}`)
    continue
  }

  const servers = Object.keys(doc.mcpServers ?? {})
  if (servers.length !== 1) {
    report.err(`${servers.length} servers defined, want exactly one per file`)
  } else if (servers[0] !== stem) {
    report.err(`server is named "${servers[0]}" but the file is "${entry}"`)
  }

  for (const [name, server] of Object.entries(doc.mcpServers ?? {})) {
    if (!server.url && !server.command) {
      report.err(`server "${name}" has neither "url" nor "command"`)
    }
    if (server.url && !/^https:\/\//.test(server.url)) {
      report.err(`server "${name}" url is not https`)
    }
  }

  for (const [pattern, what] of SECRETS) {
    if (pattern.test(raw)) report.err(`literal ${what} committed, use a \${kst_*} placeholder`)
  }
  for (const [, placeholder] of raw.matchAll(/\$\{([^}]*)\}/g)) {
    if (!/^kst_[a-z0-9_]+$/.test(placeholder)) {
      report.err(`placeholder "\${${placeholder}}" is not a Kasetto \${kst_*} reference`)
    }
  }

  if (!configured.has(stem)) {
    report.warn('not listed in kasetto.yaml, the site shows it but it is never synced')
  }
}

for (const name of configured) {
  if (!readdirSync(join(ROOT, 'mcps')).includes(`${name}.json`)) {
    report.file('kasetto.yaml')
    report.err(`names mcp "${name}" but mcps/${name}.json does not exist`)
  }
}

report.finish(count, 'mcps')
