# FROM node:20-alpine AS build
# FROM ubs_temp_workspace AS build
FROM node:20-alpine
WORKDIR /app
COPY . ./
RUN npm install
ARG APP_NAME
RUN npm run build ${APP_NAME}

FROM ubs_temp_prod
ARG APP_NAME
WORKDIR /app
COPY --from=build /app/dist/apps/${APP_NAME} /app
CMD ["node", "/app/main.js"]
