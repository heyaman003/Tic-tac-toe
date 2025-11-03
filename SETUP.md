# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- Node.js 20 or higher (`node --version`)
- npm or yarn (`npm --version`)
- Docker Desktop (for containerized setup)
- Git

## 5-Minute Setup (Docker)

### Step 1: Environment Files

Create `.env` in `server/` directory:
```bash
cd server
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/tictactoe?schema=public"
JWT_SECRET="change-this-to-a-secure-random-string-in-production"
JWT_EXPIRATION="7d"
PORT=3000
EOF
cd ..
```

Create `.env` in `clients/` directory:
```bash
cd clients
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000
EOF
cd ..
```

### Step 2: Start Everything

```bash
# From project root
docker-compose up --build
```

Wait for all services to start. You'll see:
- PostgreSQL ready on port 5432
- Backend server running on port 3000
- Frontend app running on port 5173

### Step 3: Access the Game

Open your browser: http://localhost:5173

### Step 4: Create Account & Play

1. Click "Sign up"
2. Create a username (min 3 chars) and password (min 6 chars)
3. You'll be redirected to the home page
4. Open another browser/incognito window to create a second user
5. Challenge each other to a game!

## Local Development Setup

### Backend

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create .env file (see above)

# 3. Start PostgreSQL (Docker)
docker run --name tictactoe-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tictactoe -p 5432:5432 -d postgres:16-alpine

# 4. Run migrations
npx prisma migrate dev --name init
npx prisma generate

# 5. Start dev server
npm run start:dev
```

### Frontend

```bash
# 1. Install dependencies
cd clients
npm install

# 2. Create .env file (see above)

# 3. Start dev server
npm run dev
```

## Verify Installation

1. Backend health: http://localhost:3000
2. Frontend: http://localhost:5173
3. Database: Should be accessible on localhost:5432

## Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker restart tictactoe-db
```

### Prisma Client Not Generated
```bash
cd server
npx prisma generate
```

## Reset Database

```bash
cd server
npx prisma migrate reset
npx prisma migrate dev
```

## Stop All Services

```bash
# Docker Compose
docker-compose down

# Or with volume cleanup
docker-compose down -v
```

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Update `DATABASE_URL` to production database
- [ ] Update `VITE_API_URL` to production API URL
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Enable database backups
- [ ] Configure CORS for production domain

## Next Steps

- Read the main README.md for detailed documentation
- Check the API endpoints section
- Review the game rules
- Explore the codebase structure

Enjoy the game! 



