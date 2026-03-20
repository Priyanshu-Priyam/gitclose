import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { createHash } from "crypto";
import type { LLMResponse } from "./llm-client.js";

interface CacheEntry {
  requestHash: string;
  agentName: string;
  iteration: number;
  response: LLMResponse;
  timestamp: string;
}

export class ResponseCache {
  private cacheDir: string;
  private entries: Map<string, LLMResponse> = new Map();
  private recording = false;
  private recorded: CacheEntry[] = [];

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  private hashRequest(systemPrompt: string, messagesJson: string): string {
    return createHash("sha256")
      .update(systemPrompt + messagesJson)
      .digest("hex")
      .slice(0, 16);
  }

  startRecording(): void {
    this.recording = true;
    this.recorded = [];
  }

  record(
    agentName: string,
    iteration: number,
    systemPrompt: string,
    messagesJson: string,
    response: LLMResponse
  ): void {
    if (!this.recording) return;
    const hash = this.hashRequest(systemPrompt, messagesJson);
    this.recorded.push({
      requestHash: hash,
      agentName,
      iteration,
      response,
      timestamp: new Date().toISOString(),
    });
  }

  saveRecording(agentName: string): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
    const filePath = join(this.cacheDir, `${agentName}.json`);
    writeFileSync(filePath, JSON.stringify(this.recorded, null, 2), "utf-8");
    this.recording = false;
  }

  loadCachedResponses(agentName: string): boolean {
    const filePath = join(this.cacheDir, `${agentName}.json`);
    if (!existsSync(filePath)) return false;

    try {
      const data = JSON.parse(readFileSync(filePath, "utf-8")) as CacheEntry[];
      for (const entry of data) {
        this.entries.set(`${entry.agentName}-${entry.iteration}`, entry.response);
      }
      return true;
    } catch {
      return false;
    }
  }

  getReplay(agentName: string, iteration: number): LLMResponse | undefined {
    return this.entries.get(`${agentName}-${iteration}`);
  }
}
