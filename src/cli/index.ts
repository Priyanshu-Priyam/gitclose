#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("gitclose")
  .description("Git-native monthly close platform")
  .version("0.1.0");

program
  .command("open")
  .description("Open a new close cycle")
  .requiredOption("--entity <id>", "Entity ID")
  .requiredOption("--period <period>", "Period (YYYY-MM)")
  .action(async (opts) => {
    const { openClose } = await import("./commands/open.js");
    await openClose(opts.entity, opts.period);
  });

program
  .command("run")
  .description("Run a single agent task")
  .requiredOption("--task <task>", "Task name")
  .requiredOption("--agent <agent>", "Agent name")
  .option("--replay", "Use cached LLM responses")
  .action(async (opts) => {
    const { runTask } = await import("./commands/run.js");
    await runTask(opts.task, opts.agent, { replay: opts.replay });
  });

program
  .command("run-all")
  .description("Run all agents sequentially (Atlas → Nova → Echo)")
  .option("--replay", "Use cached LLM responses")
  .action(async (opts) => {
    const { runAll } = await import("./commands/run-all.js");
    await runAll({ replay: opts.replay });
  });

program
  .command("status")
  .description("Show close status dashboard")
  .action(async () => {
    const { showStatus } = await import("./commands/status.js");
    await showStatus();
  });

program
  .command("review")
  .description("Review and approve a pull request")
  .requiredOption("--pr <id>", "PR number")
  .requiredOption("--action <action>", "approve or reject")
  .requiredOption("--reviewer <name>", "Reviewer identifier")
  .action(async (opts) => {
    const { reviewPR } = await import("./commands/review.js");
    await reviewPR(parseInt(opts.pr), opts.action, opts.reviewer);
  });

program
  .command("finalize")
  .description("Finalize the close — merge all approved PRs, tag, generate summary")
  .action(async () => {
    const { finalizeClose } = await import("./commands/finalize.js");
    await finalizeClose();
  });

program.parse();
