# worker-go/Dockerfile
# --- ESTÁGIO 1: Build da Aplicação ---
FROM golang:1.25-alpine AS builder

# Instala ferramentas necessárias
RUN apk add --no-cache git

# Define o diretório de trabalho
WORKDIR /app

# 1. Copia APENAS o go.mod
COPY go.mod .

# 2. Garante que o go.sum está correto e baixa as libs.
RUN go mod tidy
RUN go mod download

# 3. Copia o código-fonte restante
# (Se tivéssemos subpastas, copiaríamos elas aqui. Por enquanto, a cópia 'tudo' pode funcionar.)
COPY . . 

# 4. Compila o binário
# Usamos 'go get' imediatamente antes do build para garantir que a dependência seja resolvida
RUN go get ./... 
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker .

# --- ESTÁGIO 2: Produção (Imagem Final) ---
# ... (o resto do arquivo permanece o mesmo)

# --- ESTÁGIO 2: Produção (Imagem Final) ---
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/worker .
CMD ["./worker"]