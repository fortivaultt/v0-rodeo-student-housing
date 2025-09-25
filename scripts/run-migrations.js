process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function run() {
  try {
    const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
    if (!databaseUrl) {
      console.error(JSON.stringify({ error: 'POSTGRES_URL_NON_POOLING or POSTGRES_URL not set' }))
      process.exit(1)
    }

    const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()

    await client.query(
      `create table if not exists public.app_schema_migrations (id serial primary key, filename text unique not null, applied_at timestamptz not null default now())`,
    )

    const migrationsDir = path.join(process.cwd(), 'migrations')

    function walk(dir) {
      let results = []
      const list = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of list) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          results = results.concat(walk(full))
        } else if (entry.isFile() && entry.name.endsWith('.sql')) {
          results.push(full)
        }
      }
      return results
    }

    if (!fs.existsSync(migrationsDir)) {
      console.error(JSON.stringify({ error: 'migrations directory not found', migrationsDir }))
      await client.end()
      process.exit(1)
    }

    let files = walk(migrationsDir).map((p) => path.relative(migrationsDir, p)).sort((a, b) => a.localeCompare(b))

    const appliedRes = await client.query('select filename from public.app_schema_migrations order by filename')
    const applied = new Set(appliedRes.rows.map((r) => r.filename))

    const results = []

    for (const rel of files) {
      if (applied.has(rel)) {
        results.push({ filename: rel, status: 'skipped' })
        continue
      }
      const full = path.join(migrationsDir, rel)
      const sql = fs.readFileSync(full, 'utf8')
      try {
        await client.query('begin')
        await client.query(sql)
        await client.query('insert into public.app_schema_migrations (filename) values ($1)', [rel])
        await client.query('commit')
        results.push({ filename: rel, status: 'applied' })
      } catch (err) {
        await client.query('rollback')
        // Fallback: try executing statements individually (some DDL can't run inside a transaction)
        try {
          const stmts = sql
            .split(/;\s*\n/)
            .map((s) => s.trim())
            .filter(Boolean)
          for (const stmt of stmts) {
            await client.query(stmt)
          }
          await client.query('insert into public.app_schema_migrations (filename) values ($1)', [rel])
          results.push({ filename: rel, status: 'applied-without-transaction' })
        } catch (err2) {
          results.push({ filename: rel, status: 'failed', error: String(err2) })
          console.error(JSON.stringify({ error: 'Migration failed', file: rel, detail: String(err2), results }))
          await client.end()
          process.exit(2)
        }
      }
    }

    console.log(JSON.stringify({ ok: true, results }))
    await client.end()
  } catch (e) {
    console.error(JSON.stringify({ error: String(e) }))
    process.exit(1)
  }
}

run()
