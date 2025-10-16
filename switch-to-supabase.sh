#!/bin/bash

echo "🚀 Switching to Supabase setup..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize Supabase if not already done
if [ ! -f "server/supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase..."
    cd server
    supabase init
    cd ..
fi

# Start Supabase services
echo "🏃 Starting Supabase services..."
cd server
supabase start

# Get the database URL
DB_URL=$(supabase status | grep "DB URL" | awk '{print $3}')
echo "📊 Database URL: $DB_URL"

# Create .env file with Supabase configuration
echo "📝 Creating .env file..."
cat > .env << EOF
# Supabase Database
DATABASE_URL="$DB_URL"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Server Configuration
PORT=3000
NODE_ENV=development
EOF

echo "✅ Supabase setup complete!"
echo ""
echo "Next steps:"
echo "1. cd server"
echo "2. npx prisma migrate deploy"
echo "3. npx prisma generate"
echo "4. npm run start:dev"
echo ""
echo "Supabase Studio: http://localhost:54323"
echo "Database: $DB_URL"
