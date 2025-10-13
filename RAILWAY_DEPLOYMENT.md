# Railway Deployment Guide for Hevy MCP Server

## 🚀 Quick Setup

### 1. Prerequisites
- GitHub account with this repository
- Railway account (free): https://railway.app

### 2. Deploy to Railway

#### Option A: One-Click Deploy (Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/hevy-mcp)

#### Option B: Manual Setup
1. **Connect Repository**:
   ```
   1. Go to https://railway.app/new
   2. Click "Deploy from GitHub repo"
   3. Select this repository: roberwild/hevy-mcp
   4. Click "Deploy Now"
   ```

2. **Configure Environment Variables**:
   ```
   HEVY_API_KEY=39a9b904-02e7-451b-96d9-6996e34637c7
   NODE_ENV=production
   MCP_TRANSPORT=http
   ```

3. **Set Build Configuration**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:http`
   - **Port**: Railway auto-assigns (usually 3000-8000)

### 3. Expected URL
After deployment: `https://your-app-name.up.railway.app`

## ✅ Benefits of Railway

- ✅ **No 10-second timeout** like Vercel Free
- ✅ **500 hours/month free** (plenty for your usage)
- ✅ **All CRUD operations** work perfectly
- ✅ **createRoutine** will work without issues
- ✅ **Automatic HTTPS** and custom domains
- ✅ **Environment variable management**
- ✅ **Real-time logs** and monitoring

## 🔧 Configuration Files

- ✅ `railway.toml` - Railway configuration
- ✅ `Dockerfile.railway` - Optimized Docker build
- ✅ Updated `package.json` with Railway scripts

## 🧪 Testing After Deploy

```bash
# Health check
curl https://your-app.up.railway.app/health

# Test MCP endpoint
curl -X POST https://your-app.up.railway.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"help","params":{}}'

# Test routine creation (the main goal!)
curl -X POST https://your-app.up.railway.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"createRoutine","params":{"title":"Mi Primera Rutina GPT","exercises":[{"exercise_template_id":"79D0BB3A","sets":[{"type":"normal","weight_kg":60,"reps":10}]}]}}'
```

## 📊 Update GPT Schema

Once deployed, update your GPT configuration:
- **New URL**: `https://your-app.up.railway.app`
- **Use the same**: `hevy-crud-schema.json`

## 🎯 Expected Results

✅ **All operations work without timeout**:
- ✅ `getLastWorkouts` - Instant
- ✅ `getExerciseTemplates` - Fast
- ✅ `createRoutine` - **Works perfectly!**
- ✅ `updateRoutine` - No more timeouts
- ✅ `createWorkout` - Fully functional

Your GPT will finally be able to create training routines without any limitations! 💪🏋️‍♂️
