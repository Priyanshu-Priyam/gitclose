import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";

export interface AgentConfig {
  name: string;
  version: string;
  description: string;
  model: {
    provider: string;
    name: string;
    temperature: number;
    max_tokens: number;
  };
  identity: {
    display_name: string;
    department: string;
    role: string;
    reports_to: string;
  };
  tools: string[];
  permissions: {
    can_read: string[];
    can_write: string[];
    cannot: string[];
  };
  escalation: Record<string, unknown>;
  schedule: Record<string, unknown>;
}

export interface LoadedAgent {
  config: AgentConfig;
  systemPrompt: string;
  soulMd: string;
  rulesMd: string;
  dutiesMd: string;
  memoryContent: string;
  memoryPath: string;
  agentDir: string;
  toolDefinitions: Record<string, unknown>[];
}

export function loadAgent(agentDir: string): LoadedAgent {
  const configPath = join(agentDir, "agent.yaml");
  if (!existsSync(configPath)) {
    throw new Error(`Agent config not found at ${configPath}`);
  }

  const configRaw = readFileSync(configPath, "utf-8");
  const config = parseYaml(configRaw) as AgentConfig;

  const readOptional = (filename: string): string => {
    const path = join(agentDir, filename);
    return existsSync(path) ? readFileSync(path, "utf-8") : "";
  };

  const soulMd = readOptional("SOUL.md");
  const rulesMd = readOptional("RULES.md");
  const dutiesMd = readOptional("DUTIES.md");
  const memoryPath = join(agentDir, "memory", "MEMORY.md");
  const memoryContent = existsSync(memoryPath) ? readFileSync(memoryPath, "utf-8") : "";

  // Load tool definitions
  const toolDefs: Record<string, unknown>[] = [];
  const toolsDir = join(agentDir, "tools");
  if (existsSync(toolsDir)) {
    for (const toolName of config.tools) {
      const toolPath = join(toolsDir, `${toolName}.yaml`);
      if (existsSync(toolPath)) {
        const toolYaml = readFileSync(toolPath, "utf-8");
        toolDefs.push(parseYaml(toolYaml) as Record<string, unknown>);
      }
    }
  }

  // Load skill documents
  const skillsDir = join(agentDir, "skills");
  let skillsContent = "";
  if (existsSync(skillsDir)) {
    try {
      const skillFiles = readdirSync(skillsDir) as string[];
      for (const f of skillFiles) {
        if (f.endsWith(".md")) {
          skillsContent += readOptional(`skills/${f}`) + "\n\n";
        }
      }
    } catch {
      // Skills directory may be empty
    }
  }

  const systemPrompt = buildSystemPrompt(config, soulMd, rulesMd, dutiesMd, memoryContent, skillsContent);

  return {
    config,
    systemPrompt,
    soulMd,
    rulesMd,
    dutiesMd,
    memoryContent,
    memoryPath,
    agentDir,
    toolDefinitions: toolDefs,
  };
}

function buildSystemPrompt(
  config: AgentConfig,
  soul: string,
  rules: string,
  duties: string,
  memory: string,
  skills: string
): string {
  const sections: string[] = [];

  sections.push(`# Agent: ${config.identity.display_name} (${config.name} v${config.version})`);
  sections.push(`Role: ${config.identity.role}`);
  sections.push(`Department: ${config.identity.department}`);
  sections.push(`Reports to: ${config.identity.reports_to}`);
  sections.push("");

  if (soul) {
    sections.push("---");
    sections.push(soul);
  }

  if (rules) {
    sections.push("---");
    sections.push(rules);
  }

  if (duties) {
    sections.push("---");
    sections.push(duties);
  }

  if (skills) {
    sections.push("---");
    sections.push("# Skills & Procedures");
    sections.push(skills);
  }

  if (memory) {
    sections.push("---");
    sections.push("# Agent Memory (from prior periods)");
    sections.push(memory);
  }

  sections.push("---");
  sections.push("# Permissions");
  sections.push(`Can read: ${config.permissions.can_read.join(", ")}`);
  sections.push(`Can write: ${config.permissions.can_write.join(", ")}`);
  sections.push(`Cannot: ${config.permissions.cannot.join(", ")}`);

  return sections.join("\n");
}
