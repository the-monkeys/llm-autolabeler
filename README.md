## LLM Autolabeler

This server receives webhook on issue creation and auto labels the issue if not
present.

## Existing behavior

- Runs on when issue is opened
- Checks if issue already has a label, if yes then ignores it
- If not then calls LLM using openrouter api
- Gets a json response from LLM
- Updates the github issue
- If label does not exist, creates a label

- Add port in env
- Add secret for verifying webhook

Logs

- Add telmetery collector

## Todos

Env validation before starting application

// POC - JS event queue

Create training dataset for label

- Receive feedback on labels applied
- Save issue title, description and label, and user feedback
