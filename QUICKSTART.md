# 🚀 Quick Start - Get Playing in 5 Minutes!

## Prerequisites
- ✅ Docker Desktop installed and running
- ✅ That's it!

## Step 1: Environment Setup (30 seconds)

### Create Server Environment File
```bash
cd server
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/tictactoe?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"
PORT=3000
EOF
cd ..
```

### Create Client Environment File
```bash
cd clients
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000
EOF
cd ..
```

## Step 2: Start the Game (2 minutes)

```bash
# From the project root
docker-compose up --build
```

Wait for these messages:
- ✅ `tictactoe-db | database system is ready to accept connections`
- ✅ `tictactoe-server | 🚀 Server is running on: http://localhost:3000`
- ✅ `tictactoe-client | Nginx is ready`

## Step 3: Play! (2 minutes)

1. **Open Browser 1**: http://localhost:5173
   - Click "Sign up"
   - Username: `player1`
   - Password: `password123`
   - You'll see the home page

2. **Open Browser 2** (or Incognito window): http://localhost:5173
   - Click "Sign up"
   - Username: `player2`
   - Password: `password123`
   - You'll see the home page

3. **Start a Game**:
   - In Browser 1: Click "Challenge" next to player2
   - In Browser 2: Accept the invitation
   - Play! 🎮

## That's It! 🎉

You now have a fully functional multiplayer Tic-Tac-Toe game!

## Features to Try

- ⏱️ **Move Timer**: You have 30 seconds per turn
- 🏆 **ELO System**: Your rating changes based on wins/losses
- 📊 **Leaderboard**: Click the Leaderboard button to see rankings
- 🔥 **Streaks**: Win multiple games to build a streak
- 👥 **Online Status**: See who's online in real-time

## Stopping the Game

```bash
# Press Ctrl+C in the terminal, then:
docker-compose down
```

Or use the stop script:
```bash
./stop.sh
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill processes using the ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

### Docker Not Starting
- Make sure Docker Desktop is running
- Try: `docker-compose down -v` then `docker-compose up --build`

### Can't Connect
- Check if all containers are running: `docker-compose ps`
- Check logs: `docker-compose logs`

## What's Next?

- 📖 Read **README.md** for complete documentation
- 🚀 Read **DEPLOYMENT.md** to deploy to production
- 🏗️ Read **PROJECT_SUMMARY.md** to understand the architecture

## Have Fun! 🎮

Challenge your friends, climb the leaderboard, and enjoy the game!




