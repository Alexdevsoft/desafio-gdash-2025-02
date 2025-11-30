# backend/Dockerfile

# --- ESTÁGIO 1: BUILD DA APLICAÇÃO (Nomeado como 'builder') ---
FROM node:20-alpine AS builder 
WORKDIR /app

# Copia dependências (package*.json)
COPY package*.json ./
COPY tsconfig*.json nest-cli.json ./

# **MUDANÇA CRÍTICA:** Use npm ci (clean install) para maior confiabilidade no CI/CD
RUN npm ci

# Copia o código-fonte (src/)
COPY . . 

# Compila o projeto TypeScript para JavaScript (Cria a pasta /app/dist)
RUN npm run build 

# --- ESTÁGIO 2: PRODUÇÃO (Imagem Final) ---
FROM node:20-alpine AS production 
RUN apk add --no-cache curl netcat-openbsd 
WORKDIR /app

# Copia SÓ as dependências de produção
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# COPIA A PASTA DIST COMPILADA
COPY --from=builder /app/dist ./dist

EXPOSE 3000
RUN ls -l dist
# CORREÇÃO: Certificando-se que a extensão .js está aqui
CMD ["node", "/app/dist/main.js"]