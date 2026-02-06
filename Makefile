.PHONY: dev start-lgtm

dev:
	nohup deno --env-file=.env --allow-net --allow-read --allow-env server.ts &
