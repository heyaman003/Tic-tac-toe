#!/bin/bash

echo " Starting Tic-Tac-Toe Multiplayer Game..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo " Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo " server/.env not found. Creating from template..."
    cat > server/.env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/tictactoe?schema=public"
JWT_SECRET="change-this-to-a-secure-random-string-in-production"
JWT_EXPIRATION="7d"
PORT=3000
EOF
    echo "Created server/.env"
fi

if [ ! -f "clients/.env" ]; then
    echo "clients/.env not found. Creating from template..."
    cat > clients/.env << 'EOF'
VITE_API_URL=http://localhost:3000
EOF
    echo "Created clients/.env"
fi

echo ""
echo "Starting Docker containers..."
echo ""

docker-compose up --build

echo ""
echo " all services started!"
echo ""
echo "Access the game at: http://localhost:5173"
echo "API available at: http://localhost:8002"
echo ""

