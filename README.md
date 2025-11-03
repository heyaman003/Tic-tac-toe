#  Multiplayer Tic-Tac-Toe Game

A professional, full-stack multiplayer Tic-Tac-Toe game with real-time gameplay, ELO rating system, and leaderboards.

## 📸 Screenshots

### Authentication
![Login Page](./demo/Login_account.png)
*User Login Interface*

![Create Account](./demo/create_account.png)
*Registration Page*

### Dashboard & Gameplay
![Dashboard](./demo/Dashboard.png)
*Main Dashboard - View Your Profile and Online Players*

![Challenge UI](./demo/Challange_uI.png)
*Challenging Another Player*

![Invite User](./demo/Invite_User.png)
*Game Invitation Interface*

![Game UI](./demo/Game_ui.png)
*In-Game Interface*

![User Game UI](./demo/User@_Game_ui.png)
*Active Game View*

### Leaderboard
![Leaderboard](./demo/Leaderboard.png)
*Global Leaderboard with Player Statistics*

##  Features

### Core Features
- **Server-Authoritative Gameplay**: All game logic runs on the server to prevent cheating
- **Real-time Multiplayer**: WebSocket-based instant gameplay with no delays
- **Matchmaking System**: Invite online players to challenge them
- **User Authentication**: Secure JWT-based authentication
- **Online Status**: See who's online and available to play

### Advanced Features
-  **ELO Rating System**: Competitive ranking system that adjusts based on opponent strength
-  **Leaderboard**: Global rankings with stats (wins, losses, win rate, streaks)
-  **Move Timer**: 30-second time limit per move
-  **Streak Tracking**: Track winning/losing streaks
-  **Game History**: View past games and results
-  **Disconnect Handling**: Automatic game resolution when players disconnect

### UI/UX
-  **Modern Dark Theme**: Beautiful shadcn/ui components
-  **Responsive Design**: Works on all devices
-  **Real-time Updates**: Instant notifications for invites and game events

##  Tech Stack

### Backend
- **NestJS**: Progressive Node.js framework
- **PostgreSQL**: Robust relational database
- **Prisma ORM**: Type-safe database access
- **Socket.IO**: WebSocket implementation
- **JWT**: Secure authentication
- **bcryptjs**: Password hashing

### Frontend
- **React**: UI library
- **Vite**: Fast build tool
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful component library
- **Socket.IO Client**: Real-time communication
- **React Router**: Client-side routing
- **Axios**: HTTP client

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **PostgreSQL**: Database container

##  Prerequisites

- Node.js 20+ 
- npm or yarn
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL (if running without Docker)

##  Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lila-game
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in server directory
   cd server
   cat > .env << EOF
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tictactoe?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRATION="7d"
   PORT=3000
   EOF
   cd ..
   ```

   ```bash
   # Create .env file in clients directory
   cd clients
   cat > .env << EOF
   VITE_API_URL=http://localhost:3000
   EOF
   cd ..
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend server on port 3000
   - Frontend client on port 5173

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Option 2: Local Development

#### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cat > .env << EOF
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tictactoe?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRATION="7d"
   PORT=3000
   EOF
   ```

4. **Start PostgreSQL** (if not using Docker)
   ```bash
   # Make sure PostgreSQL is running on port 5432
   # Create database: tictactoe
   ```

5. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

6. **Start the backend server**
   ```bash
   npm run start:dev
   ```

#### Frontend Setup

1. **Navigate to clients directory**
   ```bash
   cd clients
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cat > .env << EOF
   VITE_API_URL=http://localhost:3000
   EOF
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173

##  How to Play

1. **Register/Login**
   ![Login](./demo/Login_account.png)
   - Create a new account or login with existing credentials
   - Minimum username length: 3 characters
   - Minimum password length: 6 characters

2. **Find Opponents**
   ![Dashboard](./demo/Dashboard.png)
   - See all online players on the home screen
   - View their ELO rating and stats
   - Click "Challenge" to send a game invite

3. **Accept Invites**
   ![Invite](./demo/Invite_User.png)
   - Receive game invitations from other players
   - Accept or reject invites

4. **Play the Game**
   ![Game UI](./demo/Game_ui.png)
   - Player X (blue) always goes first
   - You have 30 seconds per move
   - Click on an empty cell to make your move
   - First player to get 3 in a row wins!

5. **Track Your Progress**
   ![Leaderboard](./demo/Leaderboard.png)
   - View your ELO rating on your profile
   - Check the leaderboard to see global rankings
   - Track your win/loss ratio and streaks

##  Game Rules

- **Server-Authoritative**: All moves are validated on the server
- **Time Limit**: 30 seconds per move (automatic loss if exceeded)
- **Disconnect**: If a player disconnects, they automatically lose
- **No Simultaneous Games**: One game at a time per player
- **ELO System**: Rating changes based on opponent strength

##  Project Structure

```
lila-game/
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── game/          # Game logic module
│   │   ├── gateway/       # WebSocket gateway
│   │   ├── leaderboard/   # Leaderboard module
│   │   ├── prisma/        # Prisma service
│   │   └── main.ts        # Application entry
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── Dockerfile
│   └── package.json
│
├── clients/               # React Frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API & Socket services
│   │   └── lib/           # Utilities
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (protected)

### Game
- `GET /game/:id` - Get game state (protected)
- `GET /game/active/me` - Get user's active game (protected)

### Leaderboard
- `GET /leaderboard` - Get leaderboard (protected)
- `GET /leaderboard/player/:id` - Get player stats (protected)
- `GET /leaderboard/top` - Get top players (protected)
- `GET /leaderboard/streaks` - Get best streaks (protected)

### WebSocket Events

**Client to Server:**
- `authenticate` - Authenticate WebSocket connection
- `getOnlineUsers` - Request online users list
- `sendInvite` - Send game invitation
- `acceptInvite` - Accept game invitation
- `rejectInvite` - Reject game invitation
- `makeMove` - Make a game move

**Server to Client:**
- `authenticated` - Authentication confirmation
- `onlineUsers` - List of online users
- `inviteReceived` - New invitation received
- `inviteSent` - Invitation sent confirmation
- `inviteRejected` - Invitation was rejected
- `gameStarted` - Game has started
- `gameUpdate` - Game state updated
- `gameEnded` - Game has ended
- `moveError` - Move was invalid
- `opponentDisconnected` - Opponent left the game

##  Deployment

### Cloud Deployment (AWS/GCP/Azure)

1. **Set up a VM instance**
   - Ubuntu 20.04+ recommended
   - Install Docker and Docker Compose

2. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lila-game
   ```

3. **Update environment variables**
   - Update `VITE_API_URL` in docker-compose.yml to your domain
   - Change `JWT_SECRET` to a secure random string

4. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Set up reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

### Frontend Tests
```bash
cd clients
npm run test
```

##  Performance

- Handles multiple simultaneous games
- WebSocket connections for real-time updates
- Optimized database queries with Prisma
- Connection pooling for database
- Client-side caching for better UX

##  Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Server-side game validation
- CORS protection
- Input validation
- SQL injection protection (Prisma ORM)

##  Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### Frontend Can't Connect to Backend
- Check `VITE_API_URL` in `.env` file
- Ensure backend is running on correct port
- Check CORS settings in backend

### WebSocket Connection Issues
- Ensure Socket.IO is properly configured
- Check firewall rules
- Verify WebSocket is not blocked by proxy

##  License

MIT License - Feel free to use this project for learning or commercial purposes.




