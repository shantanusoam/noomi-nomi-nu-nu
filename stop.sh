#!/bin/bash

# Stop Full Stack Development Environment
# Stops Docker services (PostgreSQL, Mailhog)

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect Docker Compose command (v1 vs v2)
if docker compose version > /dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif docker-compose version > /dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose"
else
  echo "❌ Docker Compose is not installed. Please install Docker Compose."
  exit 1
fi

echo -e "${BLUE}🛑 Stopping Docker services...${NC}"
$DOCKER_COMPOSE down

echo -e "${GREEN}✅ All services stopped!${NC}"
