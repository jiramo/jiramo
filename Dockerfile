FROM node:20-alpine AS frontend-builder
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web/ .
RUN npm run build

FROM golang:1.23-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /web/dist ./web/dist
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/jiramo

FROM alpine:latest
WORKDIR /root/
COPY --from=backend-builder /app/main .

EXPOSE 8080
CMD ["./main"]