FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --workspace backend --include-workspace-root=false
COPY backend backend
RUN npm run build --workspace backend
RUN npm prune --omit=dev --workspace backend --include-workspace-root=false

FROM node:24-alpine
ENV NODE_ENV=production PORT=3001
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/backend/package.json ./package.json
COPY --from=build --chown=node:node /app/backend/dist ./dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
