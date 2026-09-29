#!/usr/bin/env node
/* Database chores, run against DATABASE_URL from .env.local.

     node scripts/db.mjs migrate        apply supabase/migrations/*.sql not yet applied
     node scripts/db.mjs seed           insert the prototype content where rows are missing
     node scripts/db.mjs admin <email>  allow an existing Supabase Auth user to edit
     node scripts/db.mjs setup          migrate + seed

   Seeding never overwrites: a section that already has a row is left alone. */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.join(root, file)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m || process.env[m[1]] !== undefined) continue
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2').replace(/\\\$/g, '$')
    }
  }
}

async function connect() {
  loadEnv()
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set (see .env.example)')
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  return client
}

async function migrate(db) {
  await db.query('create schema if not exists cms_private')
  await db.query(`create table if not exists cms_private.migrations (
    name text primary key, applied_at timestamptz not null default now())`)
  const dir = path.join(root, 'supabase', 'migrations')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
  const { rows } = await db.query('select name from cms_private.migrations')
  const done = new Set(rows.map((r) => r.name))
  for (const f of files) {
    if (done.has(f)) { console.log(`  = ${f}`); continue }
    await db.query('begin')
    try {
      await db.query(fs.readFileSync(path.join(dir, f), 'utf8'))
      await db.query('insert into cms_private.migrations (name) values ($1)', [f])
      await db.query('commit')
      console.log(`  + ${f}`)
    } catch (e) {
      await db.query('rollback')
      throw new Error(`${f}: ${e.message}`)
    }
  }
}

async function seed(db) {
  const { DEFAULT_CONTENT } = await import('../src/lib/content/defaults.ts')
  const index = JSON.parse(fs.readFileSync(path.join(root, 'src/lib/content/index-default.json'), 'utf8'))
  for (const [key, data] of Object.entries(DEFAULT_CONTENT)) {
    const r = await db.query(
      'insert into public.site_content (key, data) values ($1, $2) on conflict (key) do nothing',
      [key, data],
    )
    console.log(`  ${r.rowCount ? '+' : '='} site_content.${key}`)
  }
  const { rowCount } = await db.query("select 1 from public.index_datasets where status = 'published'")
  if (!rowCount) {
    await db.query(
      `insert into public.index_datasets (year, label, payload, status, published_at)
       values ($1, $2, $3, 'published', now())`,
      [index.meta.year, 'Prototype placeholder figures', index],
    )
    console.log('  + index_datasets (placeholder, published)')
  } else console.log('  = index_datasets (a published dataset already exists)')
}

async function admin(db, email) {
  if (!email) throw new Error('usage: node scripts/db.mjs admin <email>')
  email = email.trim().toLowerCase()
  await db.query('insert into public.admins (email) values ($1) on conflict do nothing', [email])
  const { rows } = await db.query(
    'select email_confirmed_at from auth.users where lower(email) = $1', [email])
  console.log(`  + admins: ${email}`)
  if (!rows.length) console.log('    No Supabase Auth user with that email yet. Create one in Dashboard -> Authentication -> Users (tick "Auto Confirm").')
  else if (!rows[0].email_confirmed_at) console.log('    That user has not confirmed their email, so they cannot edit until they do.')
}

const [cmd, arg] = process.argv.slice(2)
const db = await connect()
try {
  if (cmd === 'migrate') await migrate(db)
  else if (cmd === 'seed') await seed(db)
  else if (cmd === 'setup') { await migrate(db); await seed(db) }
  else if (cmd === 'admin') await admin(db, arg)
  else console.log('usage: node scripts/db.mjs migrate | seed | setup | admin <email>')
} catch (e) {
  console.error('Failed:', e.message)
  process.exitCode = 1
} finally {
  await db.end()
}
