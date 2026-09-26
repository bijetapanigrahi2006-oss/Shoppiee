import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5";

let client: Anthropic | null = null;

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

type UserContent = Anthropic.Beta.BetaContentBlockParam[] | string;

/**
 * One structured-output call to Claude. Returns null (never throws) when AI is
 * unavailable, refused, or fails — callers always have a rule-based fallback.
 */
export async function askStructured<S extends z.ZodType>(opts: {
  system: string;
  content: UserContent;
  schema: S;
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}): Promise<z.infer<S> | null> {
  if (!aiEnabled()) return null;
  try {
    const response = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 8000,
      // Server-side fallback: if the primary model declines, Anthropic re-runs
      // the request on its recommended fallback model inside the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: opts.effort ?? "medium", format: betaZodOutputFormat(opts.schema) },
      system: opts.system,
      messages: [{ role: "user", content: opts.content }],
    });
    if (response.stop_reason === "refusal") {
      console.warn("[ai] request refused", response.stop_details);
      return null;
    }
    return (response.parsed_output as z.infer<S> | null) ?? null;
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) console.error("[ai] invalid ANTHROPIC_API_KEY");
    else if (error instanceof Anthropic.RateLimitError) console.error("[ai] rate limited");
    else if (error instanceof Anthropic.APIError) console.error(`[ai] API error ${error.status}:`, error.message);
    else console.error("[ai] failed:", error);
    return null;
  }
}
