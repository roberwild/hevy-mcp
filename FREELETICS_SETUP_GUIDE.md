# 🏋️ Guía de Setup: Freeletics MCP en Raspberry Pi

## 📋 Arquitectura

```
ChatGPT GPT → Actions → Raspberry Pi (FastAPI) → freeletics-python → Freeletics API
```

---

## 🎯 Fase 1: Crear Proyecto Localmente (Windows)

### 1.1 Crear Repositorio en GitHub

```bash
# Ir a GitHub y crear nuevo repo:
# Nombre: freelytics-mcp
# Descripción: FastAPI backend for Freeletics GPT integration
# Público o Privado (tu elección)
```

### 1.2 Clonar y Configurar Proyecto

```bash
# En Windows
cd D:\Proyectos
git clone https://github.com/roberwild/freelytics-mcp.git
cd freelytics-mcp
```

### 1.3 Crear Estructura de Proyecto

```bash
# Crear estructura
freelytics-mcp/
├── main.py                 # FastAPI app
├── requirements.txt        # Dependencias Python
├── ecosystem.config.cjs    # Configuración PM2
├── .env.sample            # Template de variables
├── .gitignore             # Ignorar secrets
├── README.md              # Documentación
└── .github/
    └── workflows/
        └── deploy.yml      # Auto-deploy workflow
```

---

## 📦 Fase 2: Código del Backend

### 2.1 `requirements.txt`

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
cryptography==41.0.7
psycopg2-binary==2.9.9
redis==5.0.1
git+https://github.com/mkb79/freeletics-python.git
```

### 2.2 `main.py` (Backend completo)

```python
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cryptography.fernet import Fernet
import os
import secrets
import json
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from freeletics import FreeleticsClient, Credentials

# Configuración
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# Encryption key (guárdala en variable de entorno)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
cipher = Fernet(ENCRYPTION_KEY)

# Database connection
def get_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "freelytics"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "")
    )
    try:
        yield conn
    finally:
        conn.close()

# FastAPI app
app = FastAPI(
    title="Freeletics GPT API",
    version="1.0.0",
    description="API backend for Freeletics GPT integration"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RegisterRequest(BaseModel):
    freeletics_username: str
    freeletics_password: str

class LoginResponse(BaseModel):
    api_key: str
    message: str

# Database setup
@app.on_event("startup")
async def startup():
    """Create tables if they don't exist"""
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "freelytics"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "")
    )
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            api_key VARCHAR(64) PRIMARY KEY,
            encrypted_credentials TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            last_used TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

# Helper: Get Freeletics client from API key
async def get_freeletics_client(
    api_key: str = Security(api_key_header),
    conn = Depends(get_db)
):
    """Dependency que valida API key y devuelve cliente autenticado"""
    if not api_key:
        raise HTTPException(401, "API key required")
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT encrypted_credentials FROM users WHERE api_key = %s", (api_key,))
    row = cur.fetchone()
    cur.close()
    
    if not row:
        raise HTTPException(401, "Invalid API key")
    
    # Decrypt credentials
    try:
        creds_json = cipher.decrypt(row['encrypted_credentials'].encode()).decode()
        creds_dict = json.loads(creds_json)
        
        # Create Freeletics client
        client = FreeleticsClient.from_credentials(
            user_id=creds_dict['user_id'],
            id_token=creds_dict['id_token'],
            refresh_token=creds_dict['refresh_token'],
            access_token=creds_dict['access_token']
        )
        
        # Update last_used timestamp
        cur = conn.cursor()
        cur.execute("UPDATE users SET last_used = NOW() WHERE api_key = %s", (api_key,))
        conn.commit()
        cur.close()
        
        return client
    except Exception as e:
        raise HTTPException(500, f"Failed to authenticate: {str(e)}")

# Endpoints
@app.get("/")
async def root():
    return {
        "service": "Freeletics GPT API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {"status": "ok", "service": "freelytics-mcp"}

@app.post("/register", response_model=LoginResponse)
async def register(req: RegisterRequest, conn = Depends(get_db)):
    """
    Registra un nuevo usuario.
    Intercambia credenciales de Freeletics por un API key.
    """
    try:
        # Authenticate with Freeletics
        client = FreeleticsClient()
        client.login(req.freeletics_username, req.freeletics_password)
        creds = client.get_credentials()
        
        # Generate API key
        api_key = f"flt_{secrets.token_urlsafe(32)}"
        
        # Encrypt credentials
        creds_dict = {
            'user_id': creds.user_id,
            'id_token': creds.id_token,
            'refresh_token': creds.refresh_token,
            'access_token': creds.access_token
        }
        encrypted = cipher.encrypt(json.dumps(creds_dict).encode()).decode()
        
        # Save to database
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (api_key, encrypted_credentials) VALUES (%s, %s)",
            (api_key, encrypted)
        )
        conn.commit()
        cur.close()
        
        return LoginResponse(
            api_key=api_key,
            message="Registration successful. Save this API key for your GPT."
        )
    except Exception as e:
        raise HTTPException(400, f"Registration failed: {str(e)}")

@app.get("/profile")
async def get_profile(client: FreeleticsClient = Depends(get_freeletics_client)):
    """Obtiene el perfil del usuario"""
    try:
        profile = client.get_user_profile()
        return profile
    except Exception as e:
        raise HTTPException(500, f"Failed to get profile: {str(e)}")

@app.get("/workouts")
async def get_workouts(client: FreeleticsClient = Depends(get_freeletics_client)):
    """Obtiene los entrenamientos del usuario"""
    try:
        workouts = client.get_workouts()
        return {"workouts": workouts}
    except Exception as e:
        raise HTTPException(500, f"Failed to get workouts: {str(e)}")

@app.get("/stats")
async def get_stats(client: FreeleticsClient = Depends(get_freeletics_client)):
    """Obtiene estadísticas del usuario"""
    try:
        stats = client.get_user_stats()
        return stats
    except Exception as e:
        raise HTTPException(500, f"Failed to get stats: {str(e)}")

@app.delete("/unregister")
async def unregister(
    api_key: str = Security(api_key_header),
    conn = Depends(get_db)
):
    """Elimina la cuenta del usuario"""
    if not api_key:
        raise HTTPException(401, "API key required")
    
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE api_key = %s", (api_key,))
    deleted = cur.rowcount
    conn.commit()
    cur.close()
    
    if deleted == 0:
        raise HTTPException(404, "API key not found")
    
    return {"message": "Account deleted successfully"}
```

### 2.3 `.env.sample`

```env
# Database
DB_HOST=localhost
DB_NAME=freelytics
DB_USER=postgres
DB_PASSWORD=your_password_here

# Encryption
ENCRYPTION_KEY=generate_with_fernet

# Server
PORT=3001
NODE_ENV=production
```

### 2.4 `ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [{
    name: 'freelytics-mcp',
    script: 'uvicorn',
    args: 'main:app --host 0.0.0.0 --port 3001',
    interpreter: 'python3',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_HOST: 'localhost',
      DB_NAME: 'freelytics',
      DB_USER: 'postgres',
      DB_PASSWORD: 'TU_PASSWORD_POSTGRES',
      ENCRYPTION_KEY: 'TU_ENCRYPTION_KEY_AQUI'
    }
  }]
};
```

### 2.5 `.gitignore`

```
__pycache__/
*.pyc
.env
*.log
.venv/
venv/
ecosystem.config.cjs
```

---

## 🎯 Fase 3: Deploy en Raspberry Pi

### 3.1 Instalar PostgreSQL

```bash
# SSH a Raspberry Pi
ssh rober@192.168.1.210

# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Crear base de datos y usuario
sudo -u postgres psql

-- En el prompt de PostgreSQL:
CREATE DATABASE freelytics;
CREATE USER freelytics_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE freelytics TO freelytics_user;
\q
```

### 3.2 Clonar Proyecto

```bash
cd ~
git clone https://github.com/roberwild/freelytics-mcp.git
cd freelytics-mcp
```

### 3.3 Instalar Python y Dependencias

```bash
# Instalar Python 3 y pip
sudo apt install python3 python3-pip python3-venv -y

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3.4 Generar Encryption Key

```python
# Ejecutar en Python
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Copiar el output y usarlo como ENCRYPTION_KEY
```

### 3.5 Crear `ecosystem.config.cjs` (con valores reales)

```bash
nano ecosystem.config.cjs
# Pegar configuración con valores reales de DB y ENCRYPTION_KEY
```

### 3.6 Iniciar con PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

---

## 🌐 Fase 4: Configurar Nginx y SSL

### 4.1 Actualizar DuckDNS

```bash
nano ~/duckdns/duck.sh

# Cambiar:
domains=hevy-rober

# Por:
domains=hevy-rober,freelytics-rober
```

### 4.2 Crear Configuración Nginx

```bash
sudo nano /etc/nginx/sites-available/freelytics-mcp
```

```nginx
server {
    listen 80;
    server_name freelytics-rober.duckdns.org;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.3 Activar y Obtener SSL

```bash
sudo ln -s /etc/nginx/sites-available/freelytics-mcp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtener certificado SSL
sudo certbot --nginx -d freelytics-rober.duckdns.org
```

---

## 🚀 Fase 5: GitHub Actions Auto-Deploy

### 5.1 Crear `.github/workflows/deploy.yml`

```yaml
name: Deploy Freelytics to Raspberry Pi

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy to Production
    runs-on: self-hosted
    
    steps:
      - name: 🔔 Notify deployment started
        run: echo "🚀 Starting Freelytics deployment..."

      - name: 📥 Pull latest changes
        run: |
          set -e
          cd ~/freelytics-mcp
          echo "📊 Current commit: $(git rev-parse --short HEAD)"
          git pull origin main || { echo "❌ Git pull failed!"; exit 1; }
          echo "✅ New commit: $(git rev-parse --short HEAD)"

      - name: 📦 Install dependencies
        run: |
          cd ~/freelytics-mcp
          source venv/bin/activate
          pip install -r requirements.txt || { echo "❌ pip install failed!"; exit 1; }

      - name: ♻️ Restart server
        run: |
          cd ~/freelytics-mcp
          pm2 restart freelytics-mcp || { echo "❌ PM2 restart failed!"; exit 1; }
          echo "✅ Deployment completed!"
          pm2 status

      - name: 🧪 Verify deployment
        run: |
          sleep 3
          curl -f http://localhost:3001/health || exit 1
          curl -f https://freelytics-rober.duckdns.org/health || exit 1
          echo "✅ Deployment verified!"
```

---

## 🤖 Fase 6: Configurar GPT en ChatGPT

### 6.1 Registrar Usuario de Prueba

```bash
# Desde Windows o Postman
curl -X POST https://freelytics-rober.duckdns.org/register \
  -H "Content-Type: application/json" \
  -d '{
    "freeletics_username": "tu_usuario",
    "freeletics_password": "tu_password"
  }'

# Respuesta:
# {
#   "api_key": "flt_abc123...",
#   "message": "Registration successful..."
# }

# GUARDA EL API KEY
```

### 6.2 Obtener OpenAPI Schema

```bash
# Visita en navegador:
https://freelytics-rober.duckdns.org/openapi.json

# O con curl:
curl https://freelytics-rober.duckdns.org/openapi.json > openapi.json
```

### 6.3 Crear GPT en ChatGPT

1. Ve a ChatGPT → **Create a GPT**
2. **Configure** → **Actions**
3. Click **Import from URL**
4. Pega: `https://freelytics-rober.duckdns.org/openapi.json`
5. **Authentication** → **API Key**
   - Auth Type: Custom
   - Header Name: `X-API-Key`
   - API Key: `flt_abc123...` (el que guardaste)

### 6.4 Instructions del GPT

```
Eres FreeFit AI, un asistente personal de fitness que ayuda al usuario a gestionar y entender sus entrenamientos de Freeletics.

CAPACIDADES:
- Consultar el perfil del usuario
- Ver historial de entrenamientos
- Mostrar estadísticas y progreso
- Dar recomendaciones basadas en los datos

COMPORTAMIENTO:
- Habla de forma cercana y motivadora
- Cuando el usuario pregunte por sus entrenamientos, usa la acción getWorkouts
- Cuando pregunte por su progreso o estadísticas, usa getStats
- Presenta los datos de forma clara y visual cuando sea posible
- Si hay un error de autenticación, indica al usuario que debe configurar su API key

FORMATO:
- Usa emojis con moderación 💪
- Presenta tablas cuando muestres datos comparativos
- Resume los datos largos, no los vuelques en bruto

PRIMER USO:
Si el usuario no ha configurado su API key, explícale:
1. Ir a https://freelytics-rober.duckdns.org/register
2. Introducir sus credenciales de Freeletics
3. Copiar el API key generado
4. Volver aquí y cuando se le pida, pegar el API key
```

---

## ✅ Checklist Final

- [ ] PostgreSQL instalado y base de datos creada
- [ ] Proyecto clonado en `~/freelytics-mcp/`
- [ ] Dependencies instaladas en venv
- [ ] `ecosystem.config.cjs` con valores reales
- [ ] PM2 corriendo freelytics-mcp en puerto 3001
- [ ] DuckDNS actualizado con freelytics-rober
- [ ] Nginx configurado y SSL activo
- [ ] GitHub Actions workflow creado
- [ ] API key de prueba generado
- [ ] GPT configurado con Actions y API key

---

## 🎯 URLs Finales

- **API:** https://freelytics-rober.duckdns.org
- **Health:** https://freelytics-rober.duckdns.org/health
- **Docs:** https://freelytics-rober.duckdns.org/docs
- **Register:** https://freelytics-rober.duckdns.org/register
- **GitHub Actions:** https://github.com/roberwild/freelytics-mcp/actions

