import { Hono } from "https://deno.land/x/hono/mod.ts";
import { OpenRouter } from "npm:@openrouter/sdk";
import { Octokit } from "npm:@octokit/rest";
import { createAppAuth } from "npm:@octokit/auth-app";

const privateKey = Deno.readTextFileSync("./mama-monke.2026-02-06.private-key.pem")

const app = new Hono();

const openrouter = new OpenRouter({
  apiKey: Deno.env.get("OPEN_ROUTER_API_KEY") || "",
});

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: Deno.env.get("GITHUB_APP_ID"),
    privateKey: privateKey, // The content of your .pem file
    installationId: Deno.env.get("APP_INSTALL_ID"),
  },
});

app.post("/webhook/github", async (c) => {
  const payload = await c.req.json();
  const eventType = c.req.header("x-github-event");

  if (eventType === "issues" && payload.action === "opened") {
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
        model: "meta-llama/llama-3.3-70b-instruct",
        response_format: { type: "json_object" }, // Ensure structured output
        messages: [{ role: "user", content: prompt }],
      });

      const { label, reason } = JSON.parse(aiResponse.choices[0].message.content);
 
      // 4 & 5. Apply the label (and create if missing)
      try {
        await octokit.issues.addLabels({
          owner,
          repo,
          issue_number: issueNumber,
          labels: [label],
        });
      } catch (err) {
        if (err.status === 404 || err.message.includes("Label does not exist")) {
          // Create label then apply
          await octokit.issues.createLabel({ owner, repo, name: label, color: "ededed" });
          await octokit.issues.addLabels({ owner, repo, issue_number: issueNumber, labels: [label] });
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
  }

  return c.json({ message: "Event ignored" }, 200);
});

Deno.serve(app.fetch);
