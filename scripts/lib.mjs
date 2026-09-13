// Shared helpers for the content linters
// Zero dependencies on purpose: these run from the repo root, which has no
// package.json, so site/node_modules is not resolvable from here

import { readFileSync } from 'node:fs'

// == Frontmatter ==

// Deliberately supports only the YAML forms this repo actually uses: plain
// scalars, double-quoted scalars, folded `>-` blocks and inline `[a, b]` lists.
// Anything else is reported rather than guessed at, so the linter can never
// disagree silently with the `yaml` parser the site build uses
export function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/)
  if (!m) return { error: 'no frontmatter block' }

  const lines = m[1].split(/\r?\n/)
  const data = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue

    const kv = line.match(/^([a-z_][a-z0-9_]*):[ \t]*(.*)$/)
    if (!kv) return { error: `frontmatter line ${i + 1}: not a "key: value" pair` }

    const [, key, rest] = kv
    if (key in data) return { error: `duplicate frontmatter key "${key}"` }

    if (rest === '>-' || rest === '>') {
      const block = []
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
        block.push(lines[++i].trim())
      }
      if (block.length === 0) return { error: `"${key}": folded block is empty` }
      data[key] = block.join(' ')
    } else if (rest.startsWith('[')) {
      if (!rest.endsWith(']')) return { error: `"${key}": unterminated inline list` }
      data[key] = rest
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter((v) => v !== '')
    } else if (rest.startsWith('"')) {
      if (!rest.endsWith('"') || rest.length < 2) {
        return { error: `"${key}": unterminated double-quoted string` }
      }
      data[key] = rest.slice(1, -1).replace(/\\"/g, '"')
    } else if (rest.startsWith("'") || rest === '' || rest === '|') {
      return { error: `"${key}": unsupported YAML form, use a plain, "quoted" or >- value` }
    } else {
      data[key] = rest
    }
  }

  return { data }
}

// == Rules ==

const FIELDS = ['name', 'description', 'tags', 'updated_at']

// Claude Code's own limits on a skill's frontmatter
const MAX_NAME = 64
const MAX_DESCRIPTION = 1024

export function checkFields(data, report, { today }) {
  for (const key of FIELDS) {
    if (!(key in data)) report.err(`missing frontmatter key "${key}"`)
  }
  for (const key of Object.keys(data)) {
    if (!FIELDS.includes(key)) report.err(`unknown frontmatter key "${key}"`)
  }

  if (typeof data.name === 'string') {
    if (data.name.trim() === '') report.err('"name" is empty')
    else if (data.name.length > MAX_NAME) {
      report.err(`"name" is ${data.name.length} chars, limit is ${MAX_NAME}`)
    }
  }

  if (typeof data.description === 'string') {
    if (data.description.trim() === '') report.err('"description" is empty')
    else if (data.description.length > MAX_DESCRIPTION) {
      report.err(
        `"description" is ${data.description.length} chars, limit is ${MAX_DESCRIPTION}`,
      )
    }
  }

  if ('tags' in data) {
    if (!Array.isArray(data.tags)) report.err('"tags" is not a list')
    else if (data.tags.length === 0) report.err('"tags" is empty')
    else {
      for (const tag of data.tags) {
        if (!/^[a-z0-9][a-z0-9-]*$/.test(tag)) {
          report.err(`tag "${tag}" is not lowercase kebab-case`)
        }
      }
      const dupes = data.tags.filter((t, i) => data.tags.indexOf(t) !== i)
      for (const tag of new Set(dupes)) report.err(`duplicate tag "${tag}"`)
    }
  }

  if (typeof data.updated_at === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updated_at)) {
      report.err(`"updated_at" is "${data.updated_at}", want YYYY-MM-DD`)
    } else if (!isRealDate(data.updated_at)) {
      report.err(`"updated_at" is not a real date: ${data.updated_at}`)
    } else if (data.updated_at > today) {
      report.err(`"updated_at" is in the future: ${data.updated_at}`)
    }
  } else if ('updated_at' in data) {
    report.err('"updated_at" is not a string, quote it or use YYYY-MM-DD')
  }
}

function isRealDate(s) {
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

// == Punctuation ==

// Mirrors instructions/punctuation.md
const BANNED = [
  ['—', 'em dash, use a spaced hyphen " - "'],
  ['–', 'en dash, use a plain hyphen "-"'],
  ['“', 'curly quote, use a straight "'],
  ['”', 'curly quote, use a straight "'],
  ['‘', "curly quote, use a straight '"],
  ['’', "curly quote, use a straight '"],
  ['…', 'ellipsis character, use three periods "..."'],
  [' ', 'non-breaking space, use an ordinary space'],
]

// These two document the banned characters, so they quote them on purpose
const PUNCTUATION_ALLOWLIST = [
  'skills/humanize/',
  'instructions/punctuation.md',
]

export function checkPunctuation(path, text, report) {
  if (PUNCTUATION_ALLOWLIST.some((p) => path.startsWith(p))) return
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [ch, why] of BANNED) {
      if (line.includes(ch)) report.err(`line ${i + 1}: ${why}`)
    }
  })
}

// == kasetto.yaml ==

// Only the names under the top-level `mcps:` key are needed, so this reads the
// block directly rather than pulling in a YAML parser
export function kasettoMcpNames(root) {
  const lines = readFileSync(`${root}/kasetto.yaml`, 'utf8').split(/\r?\n/)
  const names = new Set()
  let inside = false
  for (const line of lines) {
    if (/^[a-z_]+:/.test(line)) {
      inside = line.startsWith('mcps:')
      continue
    }
    if (!inside) continue
    const m = line.match(/^\s+-\s+([a-z0-9][a-z0-9-]*)\s*$/)
    if (m) names.add(m[1])
  }
  return names
}

// == Reporting ==

export function createReport(label) {
  const errors = []
  const warnings = []
  let file = null

  return {
    file(path) {
      file = path
    },
    err(msg) {
      errors.push(`${file}: ${msg}`)
    },
    warn(msg) {
      warnings.push(`${file}: ${msg}`)
    },
    finish(count, unit) {
      for (const w of warnings) console.log(`  warn  ${w}`)
      for (const e of errors) console.log(`  error ${e}`)
      const summary = `${label}: ${count} ${unit}, ${errors.length} error(s), ${warnings.length} warning(s)`
      console.log(errors.length ? `FAIL  ${summary}` : `ok    ${summary}`)
      if (errors.length) process.exitCode = 1
    },
  }
}

export const TODAY = new Date().toISOString().slice(0, 10)
