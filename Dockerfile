ARG NODE_IMAGE=node:20-alpine

# Build stage runs on the native host platform (no QEMU).
# npm install + TypeScript compilation are platform-agnostic so this is safe.
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.docker.json ./package.json
COPY package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit --no-fund
COPY . .
ARG APP_NAME
RUN test -n "${APP_NAME}"
RUN npm run build -- ${APP_NAME}
RUN npm prune --omit=dev --legacy-peer-deps

# Runtime deps stage runs on the TARGET platform so native addons
# get the correct platform-specific binaries.
FROM ${NODE_IMAGE} AS runtime-deps
WORKDIR /app
COPY package.docker.json ./package.json
COPY package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund && \
    npm cache clean --force

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production
WORKDIR /app
ARG APP_NAME
RUN test -n "${APP_NAME}"
COPY --from=runtime-deps /app/package.json /app/package.json
COPY --from=runtime-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist/apps/${APP_NAME} /app
CMD ["node", "main.js"]
