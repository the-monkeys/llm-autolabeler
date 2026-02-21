export function addLabelPrompt(title: string, body: string) {
  return `Analyze this GitHub issue and categorize it into exactly ONE of these labels: 'triage-needed', 'bug', 'feature'.
Provide your response in JSON format: {"label": "label-name", "reason": "reason-under-150-chars"}
        
Title: ${title}
Body: ${body}
`;
}
