import { Context } from "@hono/hono";
import { issuesHandler, pingHandler } from "./handler.ts";

export const labelIssue = (c: Context) => {
  const eventType = c.req.header("x-github-event");

  if (!eventType) {
		return c.json({ message: "Bad reqeust" }, 400)
  }

  switch (eventType) {
    case "ping":
      return pingHandler(c);

    case "issues": {
      return issuesHandler(c);
    }
  }

	return c.json({ message: "Internal server error" }, 500);
};
