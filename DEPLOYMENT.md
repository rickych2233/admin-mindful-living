# Frontend Deployment Guide

## Environment Configuration

### Local Development (`.env`)
```env
VITE_LOCAL_API_BASE_URL=http://localhost:3001
VITE_SERVER_API_BASE_URL=http://72.61.143.83
VITE_USERS_API_PATH=/api/users
VITE_PROXY_TARGET=http://localhost:3001
VITE_USE_LOCAL_API=true
```

### Production Deployment (`.env.production`)
```env
VITE_LOCAL_API_BASE_URL=http://localhost:3001
VITE_SERVER_API_BASE_URL=http://72.61.143.83
VITE_USERS_API_PATH=/api/users
VITE_PROXY_TARGET=http://72.61.143.83
VITE_USE_LOCAL_API=false
```

## How It Works

### Development Mode (`npm run dev`)
- Uses Vite proxy to forward API requests to local backend (`localhost:3001`)
- `VITE_USE_LOCAL_API=true` ensures local API is used
- Hot reload enabled for fast development

### Production Build (`npm run build`)
- Creates optimized build in `dist/` folder
- Uses server API URL (`http://72.61.143.83`) directly
- No proxy - direct API calls to server

## Deployment Steps

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Configure Production Environment**
   ```bash
   # Set environment variable before building
   export VITE_USE_LOCAL_API=false
   npm run build
   ```

3. **Deploy to Server**
   - Upload contents of `dist/` folder to your web server
   - Ensure web server is configured to serve single-page app
   - All routes should redirect to `index.html`

## API Configuration Logic

The frontend automatically detects environment:
- **Development + Localhost**: Uses local API (`localhost:3001`)
- **Production**: Uses server API (`72.61.143.83`)
- **Manual Override**: Set `VITE_USE_LOCAL_API` to force specific API

## Troubleshooting

### API Not Working in Production
1. Check `VITE_USE_LOCAL_API=false` is set
2. Verify server API is accessible: `curl http://72.61.143.83/api/users`
3. Check browser console for network errors

### CORS Issues
- In development: Vite proxy handles CORS
- In production: Server must handle CORS properly

### Build Issues
- Clear cache: `rm -rf node_modules/.vite`
- Rebuild: `npm run build`

## Server Configuration Examples

### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Apache
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```