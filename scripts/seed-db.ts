import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, "..", "db");
const DB_PATH = join(DB_DIR, "meridian.db");

console.log("🔧 Seeding database...");

const db = new Database(DB_PATH);

const schema = readFileSync(join(DB_DIR, "schema.sql"), "utf-8");
db.exec(schema);
console.log("  ✓ Schema created");

const seed = readFileSync(join(DB_DIR, "seed.sql"), "utf-8");
db.exec(seed);
console.log("  ✓ Seed data inserted");

const counts = {
  entities: db.prepare("SELECT COUNT(*) as c FROM entities").get() as { c: number },
  accounts: db.prepare("SELECT COUNT(*) as c FROM chart_of_accounts").get() as { c: number },
  gl_lines: db.prepare("SELECT COUNT(*) as c FROM gl_transactions").get() as { c: number },
  bank_txns: db.prepare("SELECT COUNT(*) as c FROM bank_transactions").get() as { c: number },
  ap_invoices: db.prepare("SELECT COUNT(*) as c FROM ap_invoices").get() as { c: number },
  budget_lines: db.prepare("SELECT COUNT(*) as c FROM budget_lines").get() as { c: number },
  actuals: db.prepare("SELECT COUNT(*) as c FROM prior_period_actuals").get() as { c: number },
};

console.log(`  ✓ ${counts.entities.c} entities`);
console.log(`  ✓ ${counts.accounts.c} accounts`);
console.log(`  ✓ ${counts.gl_lines.c} GL lines`);
console.log(`  ✓ ${counts.bank_txns.c} bank transactions`);
console.log(`  ✓ ${counts.ap_invoices.c} AP invoices`);
console.log(`  ✓ ${counts.budget_lines.c} budget lines`);
console.log(`  ✓ ${counts.actuals.c} prior period actuals`);

db.close();
console.log(`\n✅ Database created at ${DB_PATH}`);
