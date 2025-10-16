#!/bin/bash

echo "🔧 Setting up Supabase connection..."

# Check if .env already exists
if [ -f "server/.env" ]; then
    echo "⚠️  .env file already exists. Creating backup..."
    cp server/.env server/.env.backup
fi

# Create .env file with Supabase configuration
echo "📝 Creating .env file with Supabase configuration..."
cat > server/.env << 'EOF'
# Supabase Database Configuration
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.mtiphcbwkyuykalnzavc:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.mtiphcbwkyuykalnzavc:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Server Configuration
PORT=3000
NODE_ENV=development
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔑 Next steps:"
echo "1. Edit server/.env and replace [YOUR-PASSWORD] with your actual Supabase password"
echo "2. Run: cd server && npx prisma migrate deploy"
echo "3. Run: cd server && npx prisma generate"
echo "4. Start your server: cd server && npm run start:dev"
echo ""
echo "📊 Your Supabase connection details:"
echo "   - Pooled URL: postgresql://postgres.mtiphcbwkyuykalnzavc:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
echo "   - Direct URL: postgresql://postgres.mtiphcbwkyuykalnzavc:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
