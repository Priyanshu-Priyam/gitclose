import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

console.log("🎬 Recording demo — all LLM responses will be cached\n");

// Reset first
console.log("Step 1: Reset to pristine state...");
execSync("npx tsx scripts/demo-reset.ts", { cwd: ROOT, stdio: "inherit" });

// Open close cycle
console.log("\nStep 2: Open close cycle...");
execSync("npx tsx src/cli/index.ts open --entity MER-AU-ENG --period 2025-01", {
  cwd: ROOT,
  stdio: "inherit",
});

// Run all agents (responses will be cached by the agent loop)
console.log("\nStep 3: Run all agents (recording responses)...");
execSync("npx tsx src/cli/index.ts run-all", {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, GITCLOSE_RECORD: "true" },
});

console.log("\n✅ Demo recorded. Cached responses saved to demo/cached-responses/");
console.log("   Use `gitclose run-all --replay` to replay.");
