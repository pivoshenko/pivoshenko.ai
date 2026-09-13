#!/usr/bin/env node
// Validates skills/ and archive/skills/ against the contract the site build and
// Kasetto both read. A skill directory without a SKILL.md, or one with malformed
// frontmatter, breaks the whole site build rather than just its own card

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  TODAY,
  checkFields,
  checkPunctuation,
  createReport,
  parseFrontmatter,
} from './lib.mjs'

const ROOT = process.cwd()
const report = createReport('skills')
let count = 0

for (const base of ['skills', 'archive/skills']) {
  const dir = join(ROOT, base)
  if (!existsSync(dir)) continue
  const live = base === 'skills'

  for (const entry of readdirSync(dir).sort()) {
    if (entry.startsWith('.')) continue
    const path = join(dir, entry)

    if (!statSync(path).isDirectory()) {
      report.file(`${base}/${entry}`)
      report.err('stray file, every entry must be a skill directory')
      continue
    }

    count++
    const skillFile = join(path, 'SKILL.md')
    const rel = `${base}/${entry}/SKILL.md`
    report.file(rel)

    if (!existsSync(skillFile)) {
      report.err('no SKILL.md, this breaks the site build')
      continue
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(entry)) {
      report.err(`directory "${entry}" is not lowercase kebab-case`)
    }

    const md = readFileSync(skillFile, 'utf8')
    const { data, error } = parseFrontmatter(md)
    if (error) {
      report.err(error)
      continue
    }

    checkFields(data, report, { today: TODAY })
    if (typeof data.name === 'string' && data.name !== entry) {
      report.err(`"name" is "${data.name}" but the directory is "${entry}"`)
    }

    // Live prose only: archive is frozen, so style drift there is not actionable
    if (live) {
      for (const file of markdownFiles(path)) {
        const relFile = relative(ROOT, file)
        report.file(relFile)
        checkPunctuation(relFile, readFileSync(file, 'utf8'), report)
      }
    }
  }
}

function markdownFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...markdownFiles(path))
    else if (entry.name.endsWith('.md')) out.push(path)
  }
  return out
}

report.finish(count, 'skills')
