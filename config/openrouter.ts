import { OpenRouter } from "npm:@openrouter/sdk";

export const openrouter = new OpenRouter({
  apiKey: Deno.env.get("OPEN_ROUTER_API_KEY") || "",
});
