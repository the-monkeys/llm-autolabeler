export function addLabelPrompt(title: string, body: string) {
  return `Analyze this GitHub issue and categorize it into exactly ONE of these labels: 'triage-needed', 'bug', 'feature'.
Provide your response in JSON format: {"label": "label-name", "reason": "reason-under-150-chars"}
        
	Some rules for labels:
			1. 'triage-needed' - This label should be applied if the issue title or description are not adequate when describing the issue
		or hinting on a discussion that is required
	2. 'feature' - This label should be applied if the issue ticket requests a feature or introduces a new behavior in the codebase
	3. 'bug' - This label should be applied when the user is hinting or facing a issue inferred from the title and description

Title: ${title}
Body: ${body}
`;
}
