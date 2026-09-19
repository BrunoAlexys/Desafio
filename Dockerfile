FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci && npm audit fix || true

COPY tsconfig*.json ./
COPY src/ src/

RUN npm run build

FROM node:22-alpine AS production

RUN apk upgrade --no-cache

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev && npm audit fix --omit=dev || true

RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx \
           /usr/local/bin/corepack \
           /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=builder /usr/src/app/dist ./dist

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]

