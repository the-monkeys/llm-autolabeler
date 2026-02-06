import { Hono } from "https://deno.land/x/hono/mod.ts";
import { labelIssue } from "./controller.ts";

export const app = new Hono();

app.get("/", (c) => {
	return c.json({ status: "healthy" })
})

app.post("/webhook/github", labelIssue)
