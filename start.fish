#!/usr/bin/env fish

# Script to start jiramo with custom PostgreSQL configuration
# Usage: ./start.fish [DB_NAME] [DB_USER] [DB_PASSWORD]

# Colors for output
set GREEN \e\[0\;32m
set BLUE \e\[0\;34m
set YELLOW \e\[1\;33m
set NC \e\[0m # No Color

echo -e "$BLUE╔════════════════════════════════════════╗$NC"
echo -e "$BLUE║      Jiramo Setup & Start Script      ║$NC"
echo -e "$BLUE╚════════════════════════════════════════╝$NC"
echo ""

# Default values
set DB_NAME (test -n "$argv[1]"; and echo $argv[1]; or echo "jiramo")
set DB_USER (test -n "$argv[2]"; and echo $argv[2]; or echo "postgres")
set DB_PASSWORD (test -n "$argv[3]"; and echo $argv[3]; or echo "")
set DB_PORT (test -n "$argv[4]"; and echo $argv[4]; or echo "5432")

echo -e "$YELLOW"Database Configuration:"$NC"
echo -e "  Database: $GREEN$DB_NAME$NC"
echo -e "  User:     $GREEN$DB_USER$NC"
if test -z "$DB_PASSWORD"
    echo -e "  Password: $GREEN<empty - trust mode>$NC"
else
    echo -e "  Password: $GREEN$DB_PASSWORD$NC"
end
echo -e "  Port:     $GREEN$DB_PORT$NC"
echo ""

# Esporta le variabili per docker-compose
set -x POSTGRES_DB $DB_NAME
set -x POSTGRES_USER $DB_USER
set -x POSTGRES_PASSWORD $DB_PASSWORD

echo -e "$BLUE→$NC Starting containers..."
echo ""

# If password is empty, use trust mode
if test -z "$DB_PASSWORD"
    set -x POSTGRES_HOST_AUTH_METHOD trust
end

docker compose up --build