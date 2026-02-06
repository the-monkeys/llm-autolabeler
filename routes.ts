import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { labelIssue } from "./controller.ts";

export const router = new Hono();

router.get("/", (c) => {
  return c.json({ status: "healthy" });
});

router.post("/webhook/github", labelIssue);
