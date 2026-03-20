import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolUseBlock, TextBlock, ContentBlock } from "@anthropic-ai/sdk/resources/messages";

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface LLMToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface LLMResponse {
  text: string;
  toolCalls: LLMToolCall[];
  stopReason: string;
  usage: { inputTokens: number; outputTokens: number };
}

export class LLMClient {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
  }

  async complete(
    systemPrompt: string,
    messages: MessageParam[],
    tools: ToolDefinition[],
    options: { model?: string; temperature?: number; maxTokens?: number } = {}
  ): Promise<LLMResponse> {
    const anthropicTools = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema as Anthropic.Messages.Tool.InputSchema,
    }));

    const response = await this.client.messages.create({
      model: options.model ?? "claude-sonnet-4-20250514",
      max_tokens: options.maxTokens ?? 8192,
      temperature: options.temperature ?? 0.1,
      system: systemPrompt,
      messages,
      tools: anthropicTools,
    });

    const textParts: string[] = [];
    const toolCalls: LLMToolCall[] = [];

    for (const block of response.content as ContentBlock[]) {
      if (block.type === "text") {
        textParts.push((block as TextBlock).text);
      } else if (block.type === "tool_use") {
        const toolBlock = block as ToolUseBlock;
        toolCalls.push({
          id: toolBlock.id,
          name: toolBlock.name,
          input: toolBlock.input as Record<string, unknown>,
        });
      }
    }

    return {
      text: textParts.join("\n"),
      toolCalls,
      stopReason: response.stop_reason ?? "end_turn",
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
