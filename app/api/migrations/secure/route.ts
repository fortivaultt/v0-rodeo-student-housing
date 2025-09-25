import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { Client } from "pg"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    // Require the Supabase service role key in the Authorization header
    const authHeader = request.headers.get("authorization") || request.headers.get("x-service-role-key")
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceKey) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 500 })
    }

    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 })
    }

    // Support 'Bearer <key>' or raw key header
    const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader
    if (provided !== serviceKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
    if (!databaseUrl) {
      return NextResponse.json({ error: "POSTGRES_URL_NON_POOLING or POSTGRES_URL not set" }, { status: 500 })
    }

    // Create client with recommended SSL handling for hosted Postgres
    const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()

    try {
      await client.query(
        "create table if not exists public.app_schema_migrations (id serial primary key, filename text unique not null, applied_at timestamptz not null default now())",
      )

      const migrationsDir = path.join(process.cwd(), "migrations")
      if (!fs.existsSync(migrationsDir)) {
        return NextResponse.json({ error: "migrations directory not found", migrationsDir }, { status: 500 })
      }

      // Collect all .sql files recursively
      function walk(dir: string): string[] {
        let results: string[] = []
        const list = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of list) {
          const full = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            results = results.concat(walk(full))
          } else if (entry.isFile() && entry.name.endsWith(".sql")) {
            results.push(full)
          }
        }
        return results
      }

      const files = walk(migrationsDir).map((p) => path.relative(migrationsDir, p)).sort((a, b) => a.localeCompare(b))

      const appliedRes = await client.query("select filename from public.app_schema_migrations order by filename")
      const applied = new Set(appliedRes.rows.map((r: any) => r.filename))

      const results: { filename: string; status: "skipped" | "applied" | "applied-without-transaction" | "failed"; error?: string }[] = []

      for (const file of files) {
        if (applied.has(file)) {
          results.push({ filename: file, status: "skipped" })
          continue
        }

        const full = path.join(migrationsDir, file)
        let sql = fs.readFileSync(full, "utf8")

        // Normalize a few constructs that can fail in some hosted environments
        sql = sql.replace(/create\s+policy\s+if\s+not\s+exists\s+([\s\S]*?);/gi, (m: string, p1: string) => {
          return `DO $$\nBEGIN\n  BEGIN\n    CREATE POLICY ${p1};\n  EXCEPTION WHEN OTHERS THEN\n    -- ignore\n  END;\nEND;\n$$;`
        })

        sql = sql.replace(/create\s+trigger\s+if\s+not\s+exists\s+([\s\S]*?);/gi, (m: string, p1: string) => {
          return `DO $$\nBEGIN\n  BEGIN\n    CREATE TRIGGER ${p1};\n  EXCEPTION WHEN OTHERS THEN\n    -- ignore\n  END;\nEND;\n$$;`
        })

        sql = sql.replace(/create\s+extension\s+if\s+not\s+exists\s+([\s\S]*?);/gi, (m: string, p1: string) => {
          return `DO $$\nBEGIN\n  BEGIN\n    CREATE EXTENSION ${p1};\n  EXCEPTION WHEN OTHERS THEN\n    -- ignore\n  END;\nEND;\n$$;`
        })

        try {
          await client.query("begin")
          await client.query(sql)
          await client.query("insert into public.app_schema_migrations (filename) values ($1)", [file])
          await client.query("commit")
          results.push({ filename: file, status: "applied" })
        } catch (err) {
          await client.query("rollback")

          // Fallback: try executing statements individually (some DDL can't run inside a transaction)
          try {
            const stmts = sql
              .split(/;\s*\n/)
              .map((s) => s.trim())
              .filter(Boolean)
            for (const stmt of stmts) {
              try {
                await client.query(stmt)
              } catch (stmtErr) {
                throw new Error(`Statement failed: ${String(stmtErr)} -- stmt: ${stmt.slice(0, 400)}`)
              }
            }
            await client.query("insert into public.app_schema_migrations (filename) values ($1)", [file])
            results.push({ filename: file, status: "applied-without-transaction" })
          } catch (err2) {
            results.push({ filename: file, status: "failed", error: String(err2) })
            await client.end()
            return NextResponse.json({ error: "Migration failed", file, detail: String(err2), results }, { status: 500 })
          }
        }
      }

      await client.end()
      return NextResponse.json({ ok: true, results })
    } catch (e) {
      await client.end()
      return NextResponse.json({ error: String(e) }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
