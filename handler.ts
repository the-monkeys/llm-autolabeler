/**
 * This file contains handlers
 *
 * These handlers are functions that runs on specific event type
 * receieved from webhook
 */

import { Context } from "@hono/hono";
import { addLabelPrompt } from "./prompts/addLabel.ts";
import { sendPrompt } from "./services/openrouter.ts";
import { octokit } from "./config/octokit.ts";

export function pingHandler(ctx: Context) {
  return ctx.text("Push event received", 202);
}

export async function issuesHandler(ctx: Context) {
  const payload = await ctx.req.json();

  if (payload.action !== "opened") {
    return ctx.json({ message: "Event ignored" }, 200);
  }

  const { issue, repository } = payload;

  const owner = repository.owner.login;
  const repo = repository.name;

  const issueNumber = issue.number;

  if (issue.labels && issue.labels.length > 0) {
    return ctx.json({ message: "Label exists" }, 200);
  }

  try {
    const prompt = addLabelPrompt(issue.title, issue.body);

    const aiResponse = await sendPrompt(prompt);

    const { label, reason } = JSON.parse(
      aiResponse.choices[0].message.content as string,
    );

    try {
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: [label],
      });
    } catch (err: any) {
      if (
        err.status === 404 || err.message.includes("Label does not exist")
      ) {
        // Create label then apply
        await octokit.issues.createLabel({
          owner,
          repo,
          name: label,
          color: "ededed",
        });
        await octokit.issues.addLabels({
          owner,
          repo,
          issue_number: issueNumber,
          labels: [label],
        });
      } else {
        throw err;
      }
    }

    return ctx.json({ message: "Triage complete", label, reason }, 200);
  } catch (error) {
    console.error("Workflow Error:", error);
    return ctx.json({ error: "Workflow failed" }, 500);
  }
}
