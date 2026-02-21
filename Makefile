BINARY_NAME := jiramo
BINARY_FOLDER := bin
WEB_DIR := web
CMD_DIR := cmd/jiramo

.PHONY: all build clean dev run build-frontend build-backend

all: build

build: clean build-frontend build-backend
	@echo "Build complete! Executable created at $(BINARY_FOLDER)/$(BINARY_NAME)"

build-frontend:
	cd $(WEB_DIR) && npm install && npm run build

build-backend:
	mkdir -p $(BINARY_FOLDER)
	CGO_ENABLED=0 go build -o $(BINARY_FOLDER)/$(BINARY_NAME) $(CMD_DIR)/main.go

dev:
	docker compose up --build

run: build
	APP_ENV=production \
	DB_HOST=$(DB_HOST) \
	DB_USER=$(DB_USER) \
	DB_PASSWORD=$(DB_PASSWORD) \
	DB_NAME=$(DB_NAME) \
	DB_PORT=$(DB_PORT) \
	JWT_SECRET=$(JWT_SECRET) \
	FRONTEND_URL=$(FRONTEND_URL) \
	./$(BINARY_FOLDER)/$(BINARY_NAME)

clean:
	rm -rf $(BINARY_FOLDER)/
	rm -rf $(WEB_DIR)/dist
	rm -rf $(WEB_DIR)/node_modules
