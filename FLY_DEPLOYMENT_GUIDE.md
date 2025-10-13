# Hevy MCP Server - Fly.io Deployment Guide

## 📋 Prerequisites

1. **Install Fly CLI**: 
   ```bash
   # Windows (PowerShell as Administrator)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Or download directly from: https://github.com/superfly/flyctl/releases
   ```

2. **Login to Fly.io**:
   ```bash
   fly auth login
   ```

## 🚀 Deployment Steps

### 1. Initialize Fly.io App
```bash
# Navigate to project directory
cd h:\Proyectos\hevy-mcp

# Launch (this will create the app)
fly launch --no-deploy
```

### 2. Set Environment Variables
```bash
# Set your Hevy API key
fly secrets set HEVY_API_KEY=39a9b904-02e7-451b-96d9-6996e34637c7

# Verify secrets
fly secrets list
```

### 3. Deploy the Application
```bash
# Deploy using our custom Dockerfile
fly deploy --dockerfile Dockerfile.flyio

# Check deployment status
fly status

# View logs
fly logs
```

### 4. Test the Deployment
```bash
# Get the app URL
fly info

# Test health endpoint
curl https://hevy-mcp-server.fly.dev/health

# Test MCP endpoint
curl -X POST https://hevy-mcp-server.fly.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"help","params":{}}'
```

## 🔧 Configuration Files Created

- ✅ `fly.toml` - Fly.io configuration
- ✅ `Dockerfile.flyio` - Optimized Docker build
- ✅ `server-flyio.js` - Entry point for Fly.io
- ✅ `.dockerignore` - Build optimization

## 🌐 Expected URL

After deployment, your server will be available at:
```
https://hevy-mcp-server.fly.dev
```

## 📊 Benefits of Fly.io Deployment

- ✅ **No timeout limitations** (unlike Vercel Free)
- ✅ **All CRUD operations** will work perfectly
- ✅ **ExerciseTemplates** fully functional
- ✅ **Better performance** with dedicated resources
- ✅ **Global edge deployment**
- ✅ **Free tier available** with generous limits

## 🔄 Update Schema

Once deployed, update your GPT schema URL from:
```
https://hevy-mcp.vercel.app
```

To:
```
https://hevy-mcp-server.fly.dev
```

## 🛠️ Troubleshooting

### Check App Status
```bash
fly status
```

### View Logs
```bash
fly logs --follow
```

### SSH into App
```bash
fly ssh console
```

### Scale Resources (if needed)
```bash
fly scale memory 512
```
