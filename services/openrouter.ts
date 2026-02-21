import { openrouter } from "../config/openrouter.ts";

export function sendPrompt(prompt: string) {
  return openrouter.chat.send({
    chatGenerationParams: {
      model: "meta-llama/llama-3.3-70b-instruct",
      responseFormat: { type: "json_object" }, // Ensure structured output
      messages: [{ role: "user", content: prompt }],
    },
  });
}
