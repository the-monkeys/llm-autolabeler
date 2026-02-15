import { Context } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { openrouter } from "./config/openrouter.ts";
import { octokit } from "./config/octokit.ts";

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
    console.log(`Issue #${issueNumber} already has labels. Skipping.`);
    return c.json({ message: "Label exists" }, 200);
  }

  try {
    // 3. Call LLM to pick label and provide reason
    const prompt = `
        Analyze this GitHub issue and categorize it into exactly ONE of these labels: 'triage-needed', 'bug', 'feature'.
        Provide your response in JSON format: {"label": "label-name", "reason": "reason-under-150-chars"}
        
        Title: ${issue.title}
        Body: ${issue.body}
      `;

    const aiResponse = await openrouter.chat.send({
      chatGenerationParams: {
        model: "meta-llama/llama-3.3-70b-instruct",
        responseFormat: { type: "json_object" }, // Ensure structured output
        messages: [{ role: "user", content: prompt }],
      },
    });

    const { label, reason } = JSON.parse(
      aiResponse.choices[0].message.content,
    );

    // 4 & 5. Apply the label (and create if missing)
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
