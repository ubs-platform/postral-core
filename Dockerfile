# FROM node:20-alpine AS build
# FROM ubs_temp_workspace AS build
FROM node:20-alpine
WORKDIR /app
COPY package.json package.json
RUN npm install --production
ARG APP_NAME
WORKDIR /app
COPY --from=build /app/dist/apps/${APP_NAME} /app
CMD ["node", "/app/main.js"]
