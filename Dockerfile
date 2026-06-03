# syntax=docker.io/docker/dockerfile-upstream:1.24.0
# check=error=true

# Aufruf:   docker build --tag juergenzimmermann/kunde:2026.4.1-hardened .

ARG BUN_VERSION=1.3.14

FROM oven/bun:${BUN_VERSION}-slim AS dist

WORKDIR /app

RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=bun.lock,target=bun.lock \
  --mount=type=cache,target=/root/.bun <<EOF
  bun install --frozen-lockfile --production
EOF

FROM dhi.io/bun:${BUN_VERSION}-debian13 AS final

WORKDIR /opt/app

USER nonroot

COPY --chown=nonroot:nonroot package.json ./
COPY --from=dist --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot src ./src

LABEL org.opencontainers.image.title="kunde" \
  org.opencontainers.image.description="Appserver Kunde mit Bun und Debian 13" \
  org.opencontainers.image.version="2026.4.1-hardened" \
  org.opencontainers.image.licenses="GPL-3.0-or-later"

EXPOSE 3000
EXPOSE 3030

ENV BUN_BIND_HOST=0.0.0.0

ENTRYPOINT ["bun", "run", "src/index.mts"]
