import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { Pool } from "pg"
import * as Sentry from "../../../lib/sentry"

export const runtime = "nodejs"

function isAllowedIp(ip: string | null, allowlist?: string) {
  if (!allowlist) return true
  if (!ip) return false
  const list = allowlist.split(",").map((s) => s.trim())
  return list.includes(ip)
}

export async function POST(request: Request) {
  const sentry = Sentry.init()
  try {
    // Authentication: require a deploy key (different from SUPABASE_SERVICE_ROLE_KEY)
    const deployKeyHeader = request.headers.get("x-deploy-key") || request.headers.get("authorization")
    const deployKey = process.env.MIGRATIONS_DEPLOY_KEY

    if (!deployKey) {
      sentry.captureMessage("MIGRATIONS_DEPLOY_KEY not configured")
      return NextResponse.json({ error: "MIGRATIONS_DEPLOY_KEY not configured" }, { status: 500 })
    }

    if (!deployKeyHeader) {
      sentry.captureMessage("Missing deploy key header")
      return NextResponse.json({ error: "Missing deploy key header" }, { status: 401 })
    }

    // Support 'Bearer <key>' or raw key
    const providedKey = deployKeyHeader.startsWith("Bearer ") ? deployKeyHeader.slice(7) : deployKeyHeader
    if (providedKey !== deployKey) {
      sentry.captureMessage("Invalid deploy key provided")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Optional IP allowlist
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null
    const allowlist = process.env.MIGRATIONS_ALLOWLIST // comma separated IPs
    if (!isAllowedIp(clientIp, allowlist)) {
      sentry.captureMessage(`IP not allowed: ${clientIp}`)
      return NextResponse.json({ error: "IP not allowed" }, { status: 403 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      sentry.captureMessage("SUPABASE_SERVICE_ROLE_KEY not configured")
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 500 })
    }

    const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
    if (!databaseUrl) {
      sentry.captureMessage("POSTGRES_URL not configured")
      return NextResponse.json({ error: "POSTGRES_URL_NON_POOLING or POSTGRES_URL not set" }, { status: 500 })
    }

    // Use a pool for short-lived workloads and proper SSL validation
    const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: true } })
    const client = await pool.connect()

    try {
      await client.query(
        "create table if not exists public.app_schema_migrations (id serial primary key, filename text unique not null, applied_at timestamptz not null default now())",
      )

      const migrationsDir = path.join(process.cwd(), "migrations")
      if (!fs.existsSync(migrationsDir)) {
        sentry.captureMessage("migrations directory not found")
        client.release()
        await pool.end()
        return NextResponse.json({ error: "migrations directory not found", migrationsDir }, { status: 500 })
      }

      function walk(dir: string): string[] {
        let results: string[] = []
        const list = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of list) {
          const full = path.join(dir, entry.name)
          if (entry.isDirectory()) results = results.concat(walk(full))
          else if (entry.isFile() && entry.name.endsWith(".sql")) results.push(full)
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

        // Keep compatibility: wrap constructs that may not work in transactions
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

          try {
            const stmts = sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)
            for (const stmt of stmts) {
              await client.query(stmt)
            }
            await client.query("insert into public.app_schema_migrations (filename) values ($1)", [file])
            results.push({ filename: file, status: "applied-without-transaction" })
          } catch (err2) {
            results.push({ filename: file, status: "failed", error: String(err2) })
            sentry.captureException(err2)
            client.release()
            await pool.end()
            return NextResponse.json({ error: "Migration failed", file, detail: String(err2), results }, { status: 500 })
          }
        }
      }

      client.release()
      await pool.end()
      return NextResponse.json({ ok: true, results })
    } catch (e) {
      sentry.captureException(e)
      client.release()
      await pool.end()
      return NextResponse.json({ error: String(e) }, { status: 500 })
    }
  } catch (e) {
    Sentry.init().captureException(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
