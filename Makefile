ifneq (, $(shell command -v podman 2> /dev/null))
	CONTAINER_RUNTIME := podman
endif

ifneq (, $(shell command -v docker 2> /dev/null))
	CONTAINER_RUNTIME := docker
endif

.PHONY: dev prod logs-dev logs down down-dev 

dev:
	$(CONTAINER_RUNTIME) compose --env-file .env -f compose-dev.yml up -d

logs-dev:
	$(CONTAINER_RUNTIME) compose -f compose-dev.yml logs -f

prod:
	$(CONTAINER_RUNTIME) compose --env-file .env -f compose.yml up -d

logs:
	$(CONTAINER_RUNTIME) compose -f compose.yml logs -f

down:
	$(CONTAINER_RUNTIME) compose -f compose.yml down

down-dev:
	$(CONTAINER_RUNTIME) compose -f compose-dev.yml down
