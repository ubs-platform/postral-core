# FROM node:20-alpine AS build
# FROM ubs_temp_workspace AS build
FROM node:20-alpine
WORKDIR /app
COPY package.json package.json
ARG APP_NAME
WORKDIR /app
RUN npm install --production
RUN nest build --entryFile=main --outputPath=dist/apps/${APP_NAME} --tsConfigPath=tsconfig.app.json
COPY --from=build /app/dist/apps/${APP_NAME} /app
CMD ["node", "/app/main.js"]
