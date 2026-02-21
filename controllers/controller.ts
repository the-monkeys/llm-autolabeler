import { Context } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { octokit } from "../config/octokit.ts";
import { sendPrompt } from "../services/openrouter.ts";
import { addLabelPrompt } from "../prompts/addLabel.ts";

export const labelIssue = async (c: Context) => {
  const payload = await c.req.json();
  const eventType = c.req.header("x-github-event");

  if (eventType === "ping") {
    return c.text("Push event received", 202);
  }

  if (eventType !== "issues" || payload.action !== "opened") {
    return c.json({ message: "Event ignored" }, 200);
  }

  const { issue, repository } = payload;

  const owner = repository.owner.login;
  const repo = repository.name;

  const issueNumber = issue.number;

  if (issue.labels && issue.labels.length > 0) {
    return c.json({ message: "Label exists" }, 200);
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
    } catch (err) {
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

    // 6. Log response
    console.log(`--- Triage Report ---`);
    console.log(`Issue: #${issueNumber} - ${issue.title}`);
    console.log(`Label Assigned: [${label}]`);
    console.log(`Reason: ${reason.substring(0, 150)}`);

    return c.json({ message: "Triage complete", label, reason }, 200);
  } catch (error) {
    console.error("Workflow Error:", error);
    return c.json({ error: "Workflow failed" }, 500);
  }
};
