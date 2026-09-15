# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Instalar dependências
COPY package*.json ./
RUN npm ci && npm audit fix || true

# Copiar código fonte
COPY tsconfig*.json ./
COPY src/ src/

# Compilar TypeScript
RUN npm run build

# Stage 2: Produção (Imagem mais leve)
FROM node:22-alpine AS production

# Atualizar OS e dependencias globais (Trivy)
RUN apk upgrade --no-cache

WORKDIR /usr/src/app

# Copiar apenas package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev && npm audit fix --omit=dev || true

# Remover npm, yarn e corepack globais (não necessários em runtime)
# Elimina todas as CVEs em usr/local/lib/node_modules/npm/ e opt/yarn*
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx \
           /usr/local/bin/corepack \
           /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

# Copiar os arquivos compilados da fase de build
COPY --from=builder /usr/src/app/dist ./dist

# Usuário sem privilégios de root para segurança
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

# Usar node diretamente (npm foi removido da imagem de produção)
CMD ["node", "dist/server.js"]

