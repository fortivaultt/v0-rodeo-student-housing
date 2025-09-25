import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { Client } from "pg"

export const runtime = "nodejs"

export async function GET() {
  const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!databaseUrl) {
    return NextResponse.json({ error: "POSTGRES_URL_NON_POOLING not set" }, { status: 500 })
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()

  try {
    await client.query(
      "create table if not exists public.app_schema_migrations (id serial primary key, filename text unique not null, applied_at timestamptz not null default now())",
    )

    const migrationsDir = path.join(process.cwd(), "migrations")
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b))

    const appliedRes = await client.query<{ filename: string }>(
      "select filename from public.app_schema_migrations order by filename",
    )
    const applied = new Set(appliedRes.rows.map((r) => r.filename))

    const results: { filename: string; status: "skipped" | "applied"; error?: string }[] = []

    for (const file of files) {
      if (applied.has(file)) {
        results.push({ filename: file, status: "skipped" })
        continue
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")
      try {
        await client.query("begin")
        await client.query(sql)
        await client.query("insert into public.app_schema_migrations (filename) values ($1)", [file])
        await client.query("commit")
        results.push({ filename: file, status: "applied" })
      } catch (err) {
        await client.query("rollback")
        results.push({ filename: file, status: "skipped", error: String(err) })
        return NextResponse.json({ error: "Migration failed", file, detail: String(err), results }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  } finally {
    await client.end()
  }
}
