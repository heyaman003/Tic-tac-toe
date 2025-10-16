# Nginx Proxy Setup Guide

## Frontend Configuration Complete ✅

Your frontend has been updated to work with the Nginx proxy configuration. Here's what was changed:

### 1. **API Service Updates** (`clients/src/services/api.ts`)
- Changed API base URL from `http://localhost:3000` to `/api`
- All API calls now go through the `/api/` proxy path

### 2. **Socket Service Updates** (`clients/src/services/socket.ts`)
- Updated Socket.IO connection to use relative paths
- Added explicit `/socket.io/` path configuration
- Added both WebSocket and polling transports for better compatibility

### 3. **Vite Development Proxy** (`clients/vite.config.ts`)
- Added proxy configuration for development
- `/api` requests proxy to `http://localhost:3000`
- `/socket.io` WebSocket connections proxy to `http://localhost:3000`

## Environment Variables

### Development (Vite handles proxying automatically)
No environment variables needed - Vite proxy handles everything.

### Production
Create `clients/.env.production`:
```env
# Use relative paths for production with Nginx proxy
VITE_API_URL=/api
VITE_SOCKET_URL=
```

## Your Nginx Configuration

Your Nginx config is perfect for this setup:

```nginx
# Proxy REST API
location /api/ {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Proxy WebSockets (socket.io)
location /socket.io/ {
    proxy_pass http://localhost:3000/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## How It Works

### Development Mode
1. Frontend runs on `http://localhost:5173`
2. Vite proxy intercepts `/api/*` and `/socket.io/*` requests
3. Proxies them to `http://localhost:3000` (your NestJS server)

### Production Mode
1. Frontend served by Nginx
2. Nginx intercepts `/api/*` and `/socket.io/*` requests
3. Proxies them to `http://localhost:3000` (your NestJS server)
4. All requests appear to come from the same domain

## Testing the Setup

### Development
```bash
cd clients
npm run dev
# Frontend: http://localhost:5173
# API calls automatically proxied to backend
```

### Production Build
```bash
cd clients
npm run build
# Serve the dist/ folder with Nginx
# Configure Nginx with your proxy rules
```

## Benefits

✅ **Same-origin requests** - No CORS issues
✅ **Single domain** - Everything served from one domain
✅ **WebSocket support** - Real-time features work through proxy
✅ **Development friendly** - Vite proxy for local development
✅ **Production ready** - Nginx proxy for production deployment

Your frontend is now fully configured to work with your Nginx proxy setup!
