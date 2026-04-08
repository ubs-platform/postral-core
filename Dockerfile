# FROM node:20-alpine AS build
FROM ubs_temp_workspace AS build
ARG APP_NAME
RUN test -n "${APP_NAME}"
RUN npm run build ${APP_NAME}

FROM ubs_temp_prod
ARG APP_NAME
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist/apps/${APP_NAME} /app
CMD ["node", "/app/main.js"]
