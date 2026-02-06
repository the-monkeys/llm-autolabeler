import { Octokit } from "npm:@octokit/rest";
import { createAppAuth } from "npm:@octokit/auth-app";

const privateKey = Deno.readTextFileSync("./mama-monke.2026-02-06.private-key.pem")

export const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: Deno.env.get("GITHUB_APP_ID"),
    privateKey: privateKey, // The content of your .pem file
    installationId: Deno.env.get("APP_INSTALL_ID"),
  },
});
