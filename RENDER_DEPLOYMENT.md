# 🚀 Render Deployment Guide - Hevy MCP Server

## ✅ Free Alternative to Railway

Render ofrece 750 horas/mes gratis - perfecto para el MCP de Hevy.

---

## 📋 **Pasos para Deployment:**

### 1️⃣ **Crear cuenta en Render**
- Ve a [render.com](https://render.com)
- Registrate con tu cuenta GitHub
- ✅ **100% Gratis** (no tarjeta de crédito)

### 2️⃣ **Conectar repositorio**
1. Click **"New +"** → **"Web Service"**
2. Conectar tu repo: `roberwild/hevy-mcp`
3. Render detecta automáticamente el Dockerfile ✅

### 3️⃣ **Configuración**
```
Name: hevy-mcp-production
Region: Frankfurt (EU)
Branch: main
Build Command: (vacío - usa Docker)
Start Command: (vacío - usa Dockerfile CMD)
```

### 4️⃣ **Variables de Entorno**
En Render dashboard → Environment:
```
NODE_ENV=production
PORT=10000
HEVY_API_KEY=tu_api_key_real
```

### 5️⃣ **Deploy**
- Click **"Create Web Service"**
- Render hace build automáticamente
- URL final: `https://hevy-mcp-production.onrender.com`

---

## 🔄 **Auto-Deploy**
- Cada `git push origin main` → Deploy automático
- Build logs visible en tiempo real
- Health checks automáticos en `/health`

---

## 🆚 **Render vs Railway**

| Feature | Render (Free) | Railway (Trial) |
|---------|---------------|-----------------|
| **Precio** | ✅ Gratis forever | ❌ $5/mes después |
| **Horas/mes** | 750h | Ilimitadas |
| **Sleep** | 15min inactividad | No |
| **Build time** | ~2min | ~1min |
| **EU Region** | ✅ Frankfurt | ✅ Europe |
| **Custom domains** | ✅ | ✅ |

---

## 🎯 **URL Final**
```
Production: https://hevy-mcp-production.onrender.com
Health: https://hevy-mcp-production.onrender.com/health
MCP Endpoint: https://hevy-mcp-production.onrender.com/mcp
```

---

## 🔧 **Actualizar GPT**
En las instrucciones del GPT, cambiar:
```
- URL Railway: https://hevy-mcp-production.up.railway.app/mcp
+ URL Render:   https://hevy-mcp-production.onrender.com/mcp
```

---

## 🆘 **Troubleshooting**

### App duerme después de 15min
**Normal en free tier** - primer request la despierta (~30s)

### Build falla
- Verificar Dockerfile existe
- Check build logs en Render dashboard

### 404 en endpoint
- Verificar `/health` funciona primero
- Check environment variables

---

## 💡 **Tips**
- ⚡ **Deploy time**: ~2-3 minutos
- 🔄 **Auto-deploy**: Activado por defecto
- 📊 **Metrics**: Panel completo gratis
- 🌍 **CDN**: Global incluido

**¡Render es perfecto para el MCP!** 🎯
