# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY tsconfig*.json ./
COPY src/ src/

# Compilar TypeScript
RUN npm run build

# Stage 2: Produção (Imagem mais leve)
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copiar apenas package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar os arquivos compilados da fase de build
COPY --from=builder /usr/src/app/dist ./dist

# Usuário sem privilégios de root para segurança
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

CMD ["npm", "start"]
