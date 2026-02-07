.PHONY: dev run-containers run-containers-build logs

dev:
	nohup deno --env-file=.env --allow-net --allow-read --allow-env server.ts &

run-containers:
	podman compose --env-file .env -f compose.yml up -d

run-containers-build:
	podman compose --env-file .env -f compose.yml up -d --build

logs:
	podman compose -f compose.yml logs -f
