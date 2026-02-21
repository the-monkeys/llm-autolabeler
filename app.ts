import { Hono } from "@hono/hono";
import { labelIssue } from "./controllers/controller.ts";

export const app = new Hono();

app.get("/", (c) => {
  return c.json({ status: "healthy" });
}).post("/webhook/github", labelIssue);
