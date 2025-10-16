# Supabase Setup Guide

## Option 1: Supabase Cloud (Recommended)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to be ready (takes 2-3 minutes)

### Step 2: Get Database URL
1. Go to Settings → Database
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: Update Environment Variables
Create a `.env` file in the `server/` directory:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Step 4: Run Database Migrations
```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### Step 5: Start the Application
```bash
# Start server only (no Docker needed for database)
cd server
npm run start:dev

# In another terminal, start client
cd clients
npm run dev
```

## Option 2: Supabase Local Development

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Initialize Supabase
```bash
cd server
supabase init
```

### Step 3: Start Local Supabase
```bash
supabase start
```

This will start:
- PostgreSQL database on port 54322
- Supabase Studio on port 54323
- API Gateway on port 54321

### Step 4: Update Environment Variables
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
```

### Step 5: Run Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

## Benefits of Using Supabase

1. **Real-time Features**: Built-in real-time subscriptions
2. **Authentication**: Built-in auth system (optional)
3. **Storage**: File storage capabilities
4. **Dashboard**: Web-based database management
5. **APIs**: Auto-generated REST and GraphQL APIs
6. **Edge Functions**: Serverless functions

## Migration from Current Setup

Your current Prisma schema will work perfectly with Supabase since it's built on PostgreSQL. No schema changes needed!

## Docker Alternative

If you want to keep using Docker but with Supabase, you can replace the postgres service in docker-compose.yml with Supabase's local setup.
