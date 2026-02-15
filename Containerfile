FROM denoland/deno:latest AS builder

WORKDIR /app
COPY . .
RUN deno install --entrypoint server.ts

# Production stage
FROM denoland/deno:latest
WORKDIR /app
COPY --from=builder /app .

ARG GITHUB_APP_ID
ARG APP_INSTALL_ID
ARG OPEN_ROUTER_API_KEY
ARG PORT

ENV GITHUB_APP_ID=$GITHUB_APP_ID
ENV APP_INSTALL_ID=$APP_INSTALL_ID
ENV OPEN_ROUTER_API_KEY=$OPEN_ROUTER_API_KEY
ENV PORT=$PORT

CMD ["deno", "--allow-net", "--allow-read", "--allow-env", "server.ts"]
