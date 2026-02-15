import { app } from "./app.ts";

Deno.serve({
  port: Number(Deno.env.get("PORT") as string),
}, app.fetch);
