import { Hono } from "https://deno.land/x/hono/mod.ts";
import { router } from "./routes.ts";

export const app = new Hono();

app.route("/", router)
