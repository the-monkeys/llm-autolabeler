ifneq (, $(shell command -v podman 2> /dev/null))
	CONTAINER_RUNTIME := podman
endif

ifneq (, $(shell command -v docker 2> /dev/null))
	CONTAINER_RUNTIME := docker
endif

.PHONY: dev run-containers run-containers-build logs

dev:
	nohup deno --env-file=.env --allow-net --allow-read --allow-env server.ts &

run-containers:
	$(CONTAINER_RUNTIME) compose --env-file .env -f compose.yml up -d

run-containers-build:
	$(CONTAINER_RUNTIME) compose --env-file .env -f compose.yml up -d --build

logs:
	$(CONTAINER_RUNTIME) compose -f compose.yml logs -f
