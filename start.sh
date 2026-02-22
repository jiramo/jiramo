#!/bin/bash

# Script to start jiramo with custom PostgreSQL configuration
# Usage: ./start.sh [DB_NAME] [DB_USER] [DB_PASSWORD]

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Jiramo Setup & Start Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Default values
DB_NAME="${1:-jiramo}"
DB_USER="${2:-postgres}"
DB_PASSWORD="${3:-}"
DB_PORT="${4:-5432}"

echo -e "${YELLOW}Database Configuration:${NC}"
echo -e "  Database: ${GREEN}${DB_NAME}${NC}"
echo -e "  User:     ${GREEN}${DB_USER}${NC}"
echo -e "  Password: ${GREEN}${DB_PASSWORD:-<empty - trust mode>}${NC}"
echo -e "  Port:     ${GREEN}${DB_PORT}${NC}"
echo ""

# Create .env file for docker-compose
cat > .env.db <<EOF
POSTGRES_DB=${DB_NAME}
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASSWORD}
EOF

# Export variables for docker-compose
export POSTGRES_DB=${DB_NAME}
export POSTGRES_USER=${DB_USER}
export POSTGRES_PASSWORD=${DB_PASSWORD}

echo -e "${BLUE}→${NC} Starting containers..."
echo ""

# If password is empty, use trust mode
if [ -z "$DB_PASSWORD" ]; then
    export POSTGRES_HOST_AUTH_METHOD=trust
    docker compose up --build
else
    docker compose up --build
fi
