import { rmSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CLOSE_REPO = join(ROOT, "close-repo");
const DB_PATH = join(ROOT, "db", "meridian.db");

console.log("🔄 Demo Reset — Rebuilding pristine state...\n");

const start = Date.now();

// 1. Remove existing close repo
if (existsSync(CLOSE_REPO)) {
  rmSync(CLOSE_REPO, { recursive: true, force: true });
  console.log("  ✓ Removed close-repo/");
}

// 2. Rebuild database
if (existsSync(DB_PATH)) {
  rmSync(DB_PATH);
}
console.log("  ✓ Rebuilding database...");
execSync("npx tsx scripts/seed-db.ts", { cwd: ROOT, stdio: "pipe" });
console.log("  ✓ Database rebuilt");

// 3. Run verification
console.log("  ✓ Running verification...");
try {
  execSync("npx tsx scripts/verify.ts", { cwd: ROOT, stdio: "pipe" });
  console.log("  ✓ All verification checks passed");
} catch {
  console.error("  ❌ Verification failed! Check data integrity.");
  process.exit(1);
}

const elapsed = Date.now() - start;
console.log(`\n✅ Demo reset complete in ${elapsed}ms`);
console.log("   Ready for `gitclose open --entity MER-AU-ENG --period 2025-01`");
