import { runTask } from "./run.js";

const AGENT_SEQUENCE: Array<{ task: string; agent: string }> = [
  { task: "cash-recon-westpac-operating", agent: "atlas" },
  { task: "ap-recon", agent: "nova" },
  { task: "variance-commentary", agent: "echo" },
];

export async function runAll(opts: { replay?: boolean } = {}): Promise<void> {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  GitClose — Running All Agents Sequentially");
  console.log("  Atlas → Nova → Echo");
  console.log(`  Mode: ${opts.replay ? "REPLAY" : "LIVE"}`);
  console.log("═══════════════════════════════════════════════════════\n");

  const startTime = Date.now();

  for (const { task, agent } of AGENT_SEQUENCE) {
    console.log(`\n${"─".repeat(55)}`);
    await runTask(task, agent, opts);
    console.log(`${"─".repeat(55)}`);
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  ✅ All agents complete — total time: ${elapsed}s`);
  console.log("  Run `gitclose status` to see results.");
  console.log("  Run `gitclose review --pr <id> --action approve --reviewer <name>` to approve.");
  console.log("═══════════════════════════════════════════════════════\n");
}
