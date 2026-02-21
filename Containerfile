FROM denoland/deno:alpine AS builder

ARG GITHUB_APP_ID
ARG APP_INSTALL_ID
ARG OPEN_ROUTER_API_KEY
ARG PORT

ENV GITHUB_APP_ID=$GITHUB_APP_ID
ENV APP_INSTALL_ID=$APP_INSTALL_ID
ENV OPEN_ROUTER_API_KEY=$OPEN_ROUTER_API_KEY
ENV PORT=$PORT

RUN apk add curl

WORKDIR /app
COPY . .
RUN deno install --entrypoint server.ts

FROM builder as dev

WORKDIR /app

CMD ["deno", "--allow-net", "--allow-read", "--allow-env", "--watch", "server.ts"]

# Production stage
FROM builder as prod 

WORKDIR /app

CMD ["deno", "--allow-net", "--allow-read", "--allow-env", "server.ts"]
