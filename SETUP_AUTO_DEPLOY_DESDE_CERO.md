# 🚀 Setup Auto-Deploy Raspberry Pi - DESDE CERO

> **Guía paso a paso sin errores** - Sigue estos pasos exactamente y todo funcionará

**Tiempo total:** ~45 minutos  
**Nivel:** Principiante  
**Objetivo:** Tener auto-deploy funcionando con `git push`

---

## ✅ Pre-requisitos

Antes de empezar, asegúrate de tener:

- ✅ Raspberry Pi con Raspbian/Raspberry Pi OS instalado
- ✅ Acceso SSH a la Raspberry Pi
- ✅ Router con acceso al panel de administración
- ✅ Cuenta de GitHub (gratis)
- ✅ Repositorio `hevy-mcp` en tu GitHub

---

## 📋 Índice

1. [Configuración Inicial Raspberry Pi](#1-configuración-inicial-raspberry-pi)
2. [Instalar Dependencias](#2-instalar-dependencias)
3. [Clonar Proyecto](#3-clonar-proyecto)
4. [Configurar PM2](#4-configurar-pm2)
5. [Configurar Nginx](#5-configurar-nginx)
6. [Configurar IP Estática](#6-configurar-ip-estática)
7. [Configurar DuckDNS](#7-configurar-duckdns)
8. [Configurar SSL (Let's Encrypt)](#8-configurar-ssl-lets-encrypt)
9. [Configurar GitHub Actions Runner](#9-configurar-github-actions-runner)
10. [Primer Deploy](#10-primer-deploy)

---

## 1. Configuración Inicial Raspberry Pi

### 1.1 Conectar por SSH

```bash
# Desde tu PC (Windows/Mac/Linux)
ssh pi@192.168.1.XXX  # Reemplaza XXX con la IP de tu Raspberry

# Si es la primera vez, cambiar password
passwd
```

### 1.2 Actualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Crear Usuario (Opcional - Recomendado)

```bash
# Si quieres usar un usuario diferente a 'pi'
sudo adduser rober
sudo usermod -aG sudo rober

# Cerrar sesión y entrar con el nuevo usuario
exit
ssh rober@192.168.1.XXX
```

---

## 2. Instalar Dependencias

### 2.1 Instalar NVM (Node Version Manager)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar shell
source ~/.bashrc

# Verificar instalación
nvm --version
```

### 2.2 Instalar Node.js

```bash
# Instalar Node.js LTS
nvm install --lts

# Verificar
node --version  # Debe mostrar v20.x.x o superior
npm --version
```

### 2.3 Instalar PM2 (Process Manager)

```bash
npm install -g pm2

# Verificar
pm2 --version
```

### 2.4 Instalar Nginx

```bash
sudo apt install nginx -y

# Verificar
sudo systemctl status nginx
# Debe mostrar: active (running)
```

### 2.5 Instalar Certbot (para SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y

# Verificar
certbot --version
```

---

## 3. Clonar Proyecto

### 3.1 Clonar Repositorio

```bash
cd ~
git clone https://github.com/TU_USUARIO/hevy-mcp.git
cd hevy-mcp
```

> ⚠️ **IMPORTANTE:** Reemplaza `TU_USUARIO` con tu usuario de GitHub

### 3.2 Instalar Dependencias del Proyecto

```bash
npm install
```

### 3.3 Crear Archivo .env

```bash
nano .env
```

**Pega este contenido:**
```env
HEVY_API_KEY=tu_api_key_aqui
PORT=3000
NODE_ENV=production
MCP_TRANSPORT=http
MCP_HTTP_HOST=0.0.0.0
```

> ⚠️ **IMPORTANTE:** Reemplaza `tu_api_key_aqui` con tu API key real de Hevy

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 3.4 Compilar Proyecto

```bash
npm run build
```

**✅ Debe mostrar:** `Build success`

---

## 4. Configurar PM2

### 4.1 Crear Archivo de Configuración

```bash
cd ~/hevy-mcp
nano ecosystem.config.cjs
```

**Pega este contenido:**
```javascript
module.exports = {
  apps: [{
    name: 'hevy-mcp',
    script: 'dist/simple-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HEVY_API_KEY: 'TU_API_KEY_AQUI'
    }
  }]
};
```

> ⚠️ **IMPORTANTE:** Reemplaza `TU_API_KEY_AQUI` con tu API key real

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.2 Iniciar con PM2

```bash
pm2 start ecosystem.config.cjs
```

**✅ Debe mostrar:**
```
┌────┬────────────┬──────┬────┬───────────┬──────────┐
│ id │ name       │ mode │ ↺  │ status    │ cpu      │
├────┼────────────┼──────┼────┼───────────┼──────────┤
│ 0  │ hevy-mcp   │ fork │ 0  │ online    │ 0%       │
└────┴────────────┴──────┴────┴───────────┴──────────┘
```

### 4.3 Verificar que Funciona

```bash
curl http://localhost:3000/health
```

**✅ Debe responder:** `{"status":"ok","timestamp":"..."}`

### 4.4 Configurar Auto-Start

```bash
pm2 startup

# Ejecutar el comando que PM2 muestra (algo como):
# sudo env PATH=$PATH:/home/rober/.nvm/versions/node/vXX.XX.X/bin ...

pm2 save
```

**✅ Ahora PM2 arrancará automáticamente al reiniciar la Raspberry Pi**

---

## 5. Configurar Nginx

### 5.1 Eliminar Configuración Default

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 5.2 Crear Configuración para hevy-mcp

```bash
sudo nano /etc/nginx/sites-available/hevy-mcp
```

**Pega este contenido:**
```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
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

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.3 Activar Configuración

```bash
sudo ln -s /etc/nginx/sites-available/hevy-mcp /etc/nginx/sites-enabled/hevy-mcp
```

### 5.4 Verificar y Reiniciar Nginx

```bash
sudo nginx -t
# ✅ Debe mostrar: syntax is ok, test is successful

sudo systemctl restart nginx
sudo systemctl status nginx
# ✅ Debe mostrar: active (running)
```

### 5.5 Test desde Local

```bash
curl http://localhost/health
```

**✅ Debe responder:** `{"status":"ok",...}`

---

## 6. Configurar IP Estática

### 6.1 Obtener Información de Red

```bash
ip a
# Buscar tu interfaz (eth0 o wlan0) y anota la IP actual

ip r
# Anota el gateway (algo como 192.168.1.1)
```

### 6.2 Configurar IP Estática

```bash
sudo nano /etc/dhcpcd.conf
```

**Agrega al FINAL del archivo:**
```bash
interface eth0
static ip_address=192.168.1.210/24
static routers=192.168.1.1
static domain_name_servers=1.1.1.1 8.8.8.8
```

> 📝 **Notas:**
> - Cambia `eth0` a `wlan0` si usas WiFi
> - `192.168.1.210` será tu nueva IP fija (puedes cambiarla)
> - `192.168.1.1` debe ser la IP de tu router

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 6.3 Reiniciar Red

```bash
sudo systemctl restart dhcpcd
```

### 6.4 Verificar Nueva IP

```bash
ip a
# ✅ Debe mostrar: 192.168.1.210
```

> ⚠️ **IMPORTANTE:** Ahora usa esta IP para conectarte:
> ```bash
> ssh rober@192.168.1.210
> ```

---

## 7. Configurar DuckDNS

### 7.1 Crear Cuenta en DuckDNS

1. Ve a https://www.duckdns.org
2. Inicia sesión con GitHub/Google/Twitter
3. Crea un subdominio (ej: `mi-raspberry`)
4. Copia tu **token** (lo necesitarás después)

### 7.2 Configurar Port Forwarding en Router

**⚠️ ESTE PASO ES CRÍTICO**

1. Entra al panel de administración de tu router (`192.168.1.1`)
2. Busca **"Port Forwarding"**, **"NAT"** o **"Reenvío de puertos"**
3. Crea 2 reglas:

**Regla 1 - HTTP:**
- Puerto externo: `80`
- IP interna: `192.168.1.210`
- Puerto interno: `80`
- Protocolo: `TCP`

**Regla 2 - HTTPS:**
- Puerto externo: `443`
- IP interna: `192.168.1.210`
- Puerto interno: `443`
- Protocolo: `TCP`

4. **Guarda** la configuración

### 7.3 Crear Script de Actualización

```bash
mkdir ~/duckdns
nano ~/duckdns/duck.sh
```

**Pega este contenido:**
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=TU_SUBDOMINIO&token=TU_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

> ⚠️ **IMPORTANTE:** 
> - Reemplaza `TU_SUBDOMINIO` con tu subdominio de DuckDNS
> - Reemplaza `TU_TOKEN` con tu token de DuckDNS

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 7.4 Dar Permisos de Ejecución

```bash
chmod +x ~/duckdns/duck.sh
```

### 7.5 Probar Script

```bash
~/duckdns/duck.sh
cat ~/duckdns/duck.log
```

**✅ Debe mostrar:** `OK`

### 7.6 Configurar Cron Job (Actualización Automática)

```bash
crontab -e
# Si pregunta editor, elige nano (opción 1)
```

**Agrega al final:**
```bash
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

**✅ Ahora DuckDNS se actualiza automáticamente cada 5 minutos**

### 7.7 Actualizar Nginx con Dominio

```bash
sudo nano /etc/nginx/sites-available/hevy-mcp
```

**Cambia la línea:**
```nginx
server_name _;
```

**Por:**
```nginx
server_name TU_SUBDOMINIO.duckdns.org;
```

> ⚠️ **IMPORTANTE:** Reemplaza `TU_SUBDOMINIO` con tu subdominio real

**Guarda y reinicia:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. Configurar SSL (Let's Encrypt)

### 8.1 Obtener Certificado SSL

```bash
sudo certbot --nginx -d TU_SUBDOMINIO.duckdns.org
```

> ⚠️ **IMPORTANTE:** Reemplaza `TU_SUBDOMINIO` con tu subdominio real

**Durante el proceso:**
- Email: Ingresa tu email
- Terms of Service: `Y` (acepta)
- Share email: `N` (no compartir)
- Redirect HTTP to HTTPS: `2` (sí, redirigir)

**✅ Debe mostrar:** `Congratulations!`

### 8.2 Verificar Configuración

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 8.3 Test desde Internet

**Desde tu PC o móvil (usando datos móviles):**
```
https://TU_SUBDOMINIO.duckdns.org/health
```

**✅ Debe responder:** `{"status":"ok",...}`

> 📝 Si no funciona inmediatamente, espera 5-10 minutos para que DNS propague

---

## 9. Configurar GitHub Actions Runner

### 9.1 Crear Carpeta del Runner (FUERA del proyecto)

```bash
cd ~
mkdir actions-runner && cd actions-runner
```

> ⚠️ **CRÍTICO:** El runner DEBE estar en `~/actions-runner/` (NO dentro de `~/hevy-mcp/`)

### 9.2 Descargar Runner

**Ve a GitHub:**
1. Tu repositorio → **Settings** → **Actions** → **Runners**
2. Click **"New self-hosted runner"**
3. Selecciona **Linux** y **ARM64**
4. **Copia los comandos** que GitHub te muestra

**Ejemplo de comandos (los tuyos serán diferentes):**
```bash
# Download
curl -o actions-runner-linux-arm64-2.329.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.329.0/actions-runner-linux-arm64-2.329.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-arm64-2.329.0.tar.gz
```

### 9.3 Configurar Runner

```bash
./config.sh --url https://github.com/TU_USUARIO/hevy-mcp --token TU_TOKEN
```

> ⚠️ **IMPORTANTE:** Usa el comando EXACTO que GitHub te muestra

**Durante la configuración:**
- Runner group: `Enter` (default)
- Runner name: `raspberry-pi-runner`
- Work folder: `Enter` (default)
- Labels: `Enter` (default)

**✅ Debe mostrar:** `Settings Saved`

### 9.4 Crear Script Wrapper (Fix ES Modules)

```bash
nano ~/actions-runner/run-service.sh
```

**Pega este contenido:**
```bash
#!/bin/bash
cd /home/rober/actions-runner
rm -f package.json package-lock.json
export NODE_OPTIONS="--no-experimental-detect-module"
exec ./runsvc.sh
```

> ⚠️ **IMPORTANTE:** Si tu usuario NO es `rober`, cambia la ruta

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Dar permisos:**
```bash
chmod +x ~/actions-runner/run-service.sh
```

### 9.5 Instalar como Servicio

```bash
cd ~/actions-runner
sudo ./svc.sh install
```

### 9.6 Editar Servicio para Usar Wrapper

**Primero, encuentra el nombre exacto del servicio:**
```bash
sudo systemctl list-units | grep actions.runner
```

**✅ Copia el nombre completo** (algo como `actions.runner.TU_USUARIO-hevy-mcp.raspberry-pi-runner.service`)

**Edita el servicio:**
```bash
sudo nano /etc/systemd/system/actions.runner.TU_USUARIO-hevy-mcp.raspberry-pi-runner.service
```

> ⚠️ **IMPORTANTE:** Usa el nombre EXACTO de tu servicio

**Busca la línea:**
```ini
ExecStart=/home/rober/actions-runner/runsvc.sh
```

**Cámbiala por:**
```ini
ExecStart=/home/rober/actions-runner/run-service.sh
```

> ⚠️ **IMPORTANTE:** Ajusta la ruta si tu usuario no es `rober`

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 9.7 Recargar y Activar Servicio

```bash
sudo systemctl daemon-reload
sudo systemctl start actions.runner.TU_USUARIO-hevy-mcp.raspberry-pi-runner.service
sudo systemctl enable actions.runner.TU_USUARIO-hevy-mcp.raspberry-pi-runner.service
```

> ⚠️ **IMPORTANTE:** Usa el nombre EXACTO de tu servicio

### 9.8 Verificar que Está Corriendo

```bash
sudo systemctl status actions.runner.TU_USUARIO-hevy-mcp.raspberry-pi-runner.service
```

**✅ Debe mostrar:** `Active: active (running)`

**También verifica en GitHub:**
- Tu repo → **Settings** → **Actions** → **Runners**
- **✅ Debe aparecer:** `raspberry-pi-runner` con estado **Idle** (verde)

---

## 10. Primer Deploy

### 10.1 Hacer un Cambio en el Código

**Desde tu PC (Windows):**

```bash
cd D:\Proyectos\hevy-mcp  # Ajusta la ruta a tu proyecto

# Editar cualquier archivo (ej: agregar un comentario)
# Luego:

git add .
git commit -m "test: primer auto-deploy"
git push origin main
```

### 10.2 Ver Progreso en GitHub

1. Ve a: `https://github.com/TU_USUARIO/hevy-mcp/actions`
2. Deberías ver un workflow ejecutándose
3. Click en él para ver los logs en tiempo real

**✅ Al terminar debe mostrar:** ✅ Deploy to Production

### 10.3 Verificar en Raspberry Pi

```bash
# Ver logs del runner
journalctl -u actions.runner.TU_USUARIO-hevy-mcp.raspberry-pi-runner.service -n 20

# Ver estado del servidor
pm2 status

# Ver logs del servidor
pm2 logs hevy-mcp --lines 20 --nostream
```

**✅ Debes ver mensajes como:**
- `✨ AUTO-DEPLOY FUNCIONANDO`
- `🎯 Deploy con Self-Hosted Runner`
- Timestamp actualizado

### 10.4 Test Final

```bash
# Desde Raspberry Pi
curl https://TU_SUBDOMINIO.duckdns.org/health

# Desde tu PC o móvil
# Abre navegador: https://TU_SUBDOMINIO.duckdns.org/health
```

**✅ Debe responder:** `{"status":"ok",...}`

---

## 🎉 ¡FELICIDADES!

### ✅ Sistema Completamente Funcional

Ahora tienes:
- ✅ Auto-deploy con `git push`
- ✅ HTTPS seguro con SSL
- ✅ Dominio personalizado
- ✅ Zero-downtime deployments
- ✅ Todo arranca automáticamente al reiniciar

### 🚀 Próximos Pasos

1. **Hacer cambios:** Edita código → `git push` → ¡Automático en 30 segundos!
2. **Ver documentación completa:** [AUTO_DEPLOY_COMPLETO.md](./AUTO_DEPLOY_COMPLETO.md)
3. **Comandos útiles:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

---

## 🆘 Troubleshooting Rápido

### Problema: Runner no arranca

```bash
# Ver logs
journalctl -u actions.runner.*.service -n 50

# Si hay error de ES modules, verificar:
cat ~/actions-runner/run-service.sh
# Debe contener las 4 líneas del wrapper
```

### Problema: Servidor no responde

```bash
# Ver estado
pm2 status

# Si está offline:
pm2 restart hevy-mcp

# Ver logs
pm2 logs hevy-mcp
```

### Problema: HTTPS no funciona

```bash
# Verificar certificados
sudo certbot certificates

# Si están expirados:
sudo certbot renew
sudo systemctl reload nginx
```

### Problema: DuckDNS no actualiza

```bash
# Ejecutar manualmente
~/duckdns/duck.sh
cat ~/duckdns/duck.log
# Debe mostrar: OK

# Si muestra KO, verificar token y dominio en duck.sh
```

---

## 📞 Más Ayuda

- **Documentación completa:** [AUTO_DEPLOY_COMPLETO.md](./AUTO_DEPLOY_COMPLETO.md)
- **Troubleshooting detallado:** Ver sección en `AUTO_DEPLOY_COMPLETO.md`
- **Comandos rápidos:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

---

## 📋 ANEXO: Troubleshooting Completo (Basado en Errores Reales)

> **Nota:** Esta sección documenta TODOS los errores que encontramos durante el desarrollo para que no te pase lo mismo.

---

### ❌ Error 1: `ReferenceError: require is not defined in ES module scope`

**Síntoma:**
```
ReferenceError: require is not defined in ES module scope
at file:///home/rober/actions-runner/bin/RunnerService.js:5:20
Node.js v20.19.5
```

**Causa:**
El runner de GitHub Actions está siendo afectado por el `package.json` del proyecto `hevy-mcp`, que define `"type": "module"`. Node.js v20 intenta interpretar los archivos del runner como ES modules.

**Solución:**
```bash
# 1. Mover el runner FUERA del proyecto (si está dentro)
cd ~
mv hevy-mcp/actions-runner ~/actions-runner

# 2. Crear el wrapper script con NODE_OPTIONS
nano ~/actions-runner/run-service.sh

# Contenido:
#!/bin/bash
cd /home/rober/actions-runner
rm -f package.json package-lock.json
export NODE_OPTIONS="--no-experimental-detect-module"
exec ./runsvc.sh

# 3. Dar permisos
chmod +x ~/actions-runner/run-service.sh

# 4. Actualizar el servicio systemd para usar el wrapper
sudo nano /etc/systemd/system/actions.runner.*.service
# Cambiar ExecStart=/path/to/runsvc.sh
# Por: ExecStart=/home/rober/actions-runner/run-service.sh

# 5. Recargar y reiniciar
sudo systemctl daemon-reload
sudo systemctl restart actions.runner.*.service
```

**✅ Verificación:**
```bash
sudo systemctl status actions.runner.*.service
# Debe mostrar: Active: active (running)
```

---

### ❌ Error 2: `TypeError: server.setRequestHandler is not a function`

**Síntoma:**
```
TypeError: server.setRequestHandler is not a function
at file:///home/rober/hevy-mcp/dist/index.js:123:10
```

**Causa:**
Intentaste usar `dist/index.js` con PM2, pero ese archivo está diseñado para MCP transport (stdio), no para HTTP directo. No es compatible con el modo HTTP que necesitan los GPTs.

**Solución:**
```bash
# NO usar dist/index.js
# SÍ usar dist/simple-server.js

# Verificar ecosystem.config.cjs
nano ~/hevy-mcp/ecosystem.config.cjs

# Debe contener:
module.exports = {
  apps: [{
    name: 'hevy-mcp',
    script: 'dist/simple-server.js',  // ← CORRECTO
    // NO: script: 'dist/index.js',   // ← INCORRECTO
    ...
  }]
};

# Reiniciar
pm2 delete hevy-mcp
pm2 start ecosystem.config.cjs
```

**✅ Verificación:**
```bash
pm2 status
# hevy-mcp debe estar: online

curl http://localhost:3000/health
# Debe responder: {"status":"ok",...}
```

---

### ❌ Error 3: `❌ HEVY_API_KEY is required`

**Síntoma:**
```
❌ HEVY_API_KEY is required
Server failed to start
```

**Causa:**
El archivo `.env` existe pero PM2 no lo está leyendo correctamente. PM2 necesita las variables de entorno definidas explícitamente en `ecosystem.config.cjs`.

**Solución:**
```bash
# NO confiar solo en .env con PM2
# SÍ definir variables en ecosystem.config.cjs

nano ~/hevy-mcp/ecosystem.config.cjs

# Debe contener:
module.exports = {
  apps: [{
    name: 'hevy-mcp',
    script: 'dist/simple-server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HEVY_API_KEY: 'tu_api_key_aqui'  // ← IMPORTANTE: Poner aquí
    }
  }]
};

# Reiniciar
pm2 restart hevy-mcp
```

**✅ Verificación:**
```bash
pm2 logs hevy-mcp --lines 10
# Debe mostrar: "HEVY_API_KEY: ***SET***"
# NO debe mostrar: "HEVY_API_KEY is required"
```

---

### ❌ Error 4: `nginx: [emerg] a duplicate default server for 0.0.0.0:80`

**Síntoma:**
```
nginx: [emerg] a duplicate default server for 0.0.0.0:80 in /etc/nginx/sites-enabled/default:1
nginx: configuration file /etc/nginx/nginx.conf test failed
```

**Causa:**
Nginx tiene dos archivos intentando ser el servidor "default" en el puerto 80: el archivo `default` original y tu nueva configuración `hevy-mcp`.

**Solución:**
```bash
# Eliminar el archivo default
sudo rm /etc/nginx/sites-enabled/default

# Verificar que no hay otros archivos conflictivos
ls -la /etc/nginx/sites-enabled/

# Debe mostrar SOLO: hevy-mcp (o el symlink a hevy-mcp)

# Verificar configuración
sudo nginx -t
# Debe mostrar: syntax is ok, test is successful

# Reiniciar
sudo systemctl restart nginx
```

**✅ Verificación:**
```bash
sudo systemctl status nginx
# Debe mostrar: active (running)

curl http://localhost/health
# Debe responder: {"status":"ok",...}
```

---

### ❌ Error 5: `ERR_CONNECTION_TIMED_OUT` desde Internet (pero localhost funciona)

**Síntoma:**
- ✅ `curl http://localhost/health` → Funciona
- ❌ `curl http://IP_PUBLICA/health` → Connection timed out
- ❌ Desde navegador → No carga

**Causa:**
Port Forwarding no está configurado correctamente en el router, o el firewall está bloqueando el puerto.

**Solución:**
```bash
# 1. Verificar que Nginx está escuchando en todas las interfaces
sudo netstat -tlnp | grep :80
# Debe mostrar: 0.0.0.0:80 (no 127.0.0.1:80)

# 2. Verificar que el servidor responde localmente
curl http://192.168.1.210/health  # Usar tu IP local
# Debe funcionar

# 3. Configurar Port Forwarding en el router
# Ve al panel de administración del router (ej: 192.168.1.1)
# Busca "Port Forwarding" o "NAT"
# Crea regla:
#   - Puerto externo: 80
#   - IP interna: 192.168.1.210 (tu Raspberry Pi)
#   - Puerto interno: 80
#   - Protocolo: TCP

# 4. Obtener tu IP pública
curl ifconfig.me
# Anota la IP

# 5. Probar desde fuera (usando datos móviles, NO WiFi)
# Abre navegador en móvil: http://TU_IP_PUBLICA/health
```

**⚠️ Nota sobre operadoras móviles:**
Algunas operadoras (como Digi en España) tienen CG-NAT que impide acceso directo. En ese caso, DEBES usar DuckDNS + HTTPS.

**✅ Verificación:**
```bash
# Desde fuera de tu red (móvil con datos)
curl https://tu-subdominio.duckdns.org/health
# Debe responder: {"status":"ok",...}
```

---

### ❌ Error 6: `fatal: Authentication failed for 'https://github.com/'`

**Síntoma:**
```
fatal: Authentication failed for 'https://github.com/usuario/hevy-mcp.git/'
```

**Causa:**
GitHub eliminó el soporte para autenticación con password en HTTPS desde agosto 2021. Necesitas usar Personal Access Token (PAT) o SSH.

**Solución (Opción 1 - PAT):**
```bash
# 1. Generar PAT en GitHub
# Ve a: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Generate new token → Selecciona scopes: repo, workflow
# Copia el token

# 2. Configurar git para usar PAT
git remote set-url origin https://TU_TOKEN@github.com/TU_USUARIO/hevy-mcp.git

# 3. Probar
git pull
```

**Solución (Opción 2 - SSH - Recomendado):**
```bash
# 1. Generar clave SSH en Raspberry Pi
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
# Enter, Enter, Enter (sin passphrase para CI/CD)

# 2. Copiar clave pública
cat ~/.ssh/id_ed25519.pub
# Copiar TODO el output

# 3. Agregar a GitHub
# Ve a: GitHub → Settings → SSH and GPG keys → New SSH key
# Pegar la clave pública

# 4. Cambiar remote a SSH
cd ~/hevy-mcp
git remote set-url origin git@github.com:TU_USUARIO/hevy-mcp.git

# 5. Probar
git pull
```

**✅ Verificación:**
```bash
git pull
# Debe funcionar sin pedir password
```

---

### ❌ Error 7: DuckDNS muestra `KO` en el log

**Síntoma:**
```bash
cat ~/duckdns/duck.log
KO
```

**Causa:**
Token incorrecto, subdominio incorrecto, o problema de conectividad.

**Solución:**
```bash
# 1. Verificar script
cat ~/duckdns/duck.sh

# Debe verse así (SIN errores de tipeo):
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=TU_SUBDOMINIO&token=TU_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -

# 2. Verificar en navegador (desde cualquier PC)
# Abre: https://www.duckdns.org/update?domains=TU_SUBDOMINIO&token=TU_TOKEN&verbose=true
# Debe mostrar información detallada del error

# 3. Corregir el script
nano ~/duckdns/duck.sh
# Verificar que:
#   - domains= tiene SOLO el subdominio (sin .duckdns.org)
#   - token= es el token completo de DuckDNS
#   - No hay espacios ni saltos de línea extra

# 4. Probar manualmente
~/duckdns/duck.sh
cat ~/duckdns/duck.log
# Ahora debe mostrar: OK
```

**✅ Verificación:**
```bash
# Verificar que tu dominio apunta a tu IP
nslookup tu-subdominio.duckdns.org
# Debe mostrar tu IP pública actual
```

---

### ❌ Error 8: Certificado SSL falla con `Failed authorization procedure`

**Síntoma:**
```
Failed authorization procedure
The client lacks sufficient authorization
```

**Causa:**
- Puerto 80 no está accesible desde internet (Let's Encrypt necesita verificar dominio vía HTTP)
- DuckDNS no está apuntando a tu IP correcta
- Router no tiene port forwarding configurado para puerto 80

**Solución:**
```bash
# 1. Verificar que DuckDNS funciona
cat ~/duckdns/duck.log
# Debe mostrar: OK

# 2. Verificar que el dominio apunta a tu IP
nslookup tu-subdominio.duckdns.org
curl ifconfig.me
# Las IPs deben coincidir

# 3. Verificar port forwarding puerto 80
# En router, debe haber regla:
#   Puerto externo: 80 → IP interna: 192.168.1.210 → Puerto interno: 80

# 4. Probar acceso HTTP desde internet
# Desde móvil con datos (NO WiFi):
# Abre navegador: http://tu-subdominio.duckdns.org/health
# Debe cargar

# 5. Solo después de que HTTP funcione, obtener certificado
sudo certbot --nginx -d tu-subdominio.duckdns.org
```

**✅ Verificación:**
```bash
sudo certbot certificates
# Debe mostrar certificado válido con fecha de expiración futura
```

---

### ❌ Error 9: Workflow de GitHub muestra `Error: HEVY_API_KEY is not set`

**Síntoma:**
```
Error: HEVY_API_KEY is not set in environment variables
Integration tests cannot run without a valid API key
```

**Causa:**
El workflow de GitHub Actions ejecuta `npm run build`, que implícitamente corre los tests, y los tests necesitan `HEVY_API_KEY`.

**Solución:**
```bash
# Opción 1: Agregar HEVY_API_KEY como secret en GitHub
# 1. Ve a: Tu repo → Settings → Secrets and variables → Actions
# 2. New repository secret
# 3. Name: HEVY_API_KEY
# 4. Value: tu_api_key_real
# 5. Add secret

# Opción 2: Modificar el workflow para NO correr tests
# Editar .github/workflows/deploy.yml
# Cambiar:
#   npm run build
# Por:
#   npm run build:only  # (si existe)
# O agregar --skipTests flag si el script lo soporta
```

**✅ Verificación:**
```bash
# Hacer un push y ver que el workflow pasa
git commit --allow-empty -m "test: verificar secrets"
git push origin main
# Ver en GitHub Actions que pasa sin errores
```

---

### ❌ Error 10: `! [remote rejected] main -> main (refusing to allow PAT without workflow scope)`

**Síntoma:**
```
! [remote rejected] main -> main (refusing to allow a Personal Access Token to create or update workflow .github/workflows/deploy.yml without workflow scope)
```

**Causa:**
El Personal Access Token (PAT) que estás usando no tiene el scope `workflow` necesario para modificar archivos en `.github/workflows/`.

**Solución:**
```bash
# 1. Generar NUEVO PAT con scope correcto
# Ve a: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Generate new token
# Selecciona scopes:
#   ✅ repo (todos los sub-scopes)
#   ✅ workflow  ← IMPORTANTE
# Generate token
# Copia el token

# 2. En Windows, eliminar credenciales viejas
# Panel de Control → Administrador de credenciales → Credenciales de Windows
# Buscar "github.com" y eliminar

# 3. Hacer push nuevamente
git push origin main
# Te pedirá credenciales
# Usuario: tu_usuario_github
# Password: PEGAR_EL_NUEVO_TOKEN (NO tu password de GitHub)
```

**✅ Verificación:**
```bash
git push origin main
# Debe funcionar sin error de workflow scope
```

---

### ❌ Error 11: PM2 muestra muchos restarts (↺ 50+)

**Síntoma:**
```
pm2 status
│ id │ name      │ mode │ ↺    │ status  │
├────┼───────────┼──────┼──────┼─────────┤
│ 0  │ hevy-mcp  │ fork │ 73   │ online  │
```

**Causa:**
El servidor está crasheando constantemente (por error en código, falta API key, etc.) y PM2 lo reinicia automáticamente.

**Solución:**
```bash
# 1. Ver logs para identificar el error
pm2 logs hevy-mcp --lines 50

# 2. Errores comunes:
#    - "HEVY_API_KEY is required" → Ver Error 3
#    - "Cannot find module" → npm install
#    - "setRequestHandler is not a function" → Ver Error 2
#    - Error de sintaxis → Revisar último commit

# 3. Detener el servidor mientras investigas
pm2 stop hevy-mcp

# 4. Corregir el problema

# 5. Reiniciar y monitorear
pm2 restart hevy-mcp
pm2 logs hevy-mcp
# Verificar que NO se reinicia constantemente
```

**✅ Verificación:**
```bash
pm2 status
# Después de 1 minuto, ↺ debe ser 0 o muy bajo (1-2)
```

---

### ❌ Error 12: Servidor funciona en WiFi pero NO desde datos móviles

**Síntoma:**
- ✅ Desde WiFi (misma red): `https://tu-dominio.duckdns.org/health` → Funciona
- ❌ Desde datos móviles: `https://tu-dominio.duckdns.org/health` → No carga

**Causa:**
Cuando estás en WiFi de tu casa, tu router resuelve el dominio a la IP local (192.168.1.210) directamente. Desde fuera, necesitas port forwarding configurado correctamente.

**Solución:**
```bash
# 1. Verificar port forwarding puerto 443 en router
# Debe existir regla:
#   Puerto externo: 443 → IP interna: 192.168.1.210 → Puerto interno: 443

# 2. Verificar que Nginx escucha en 443
sudo netstat -tlnp | grep :443
# Debe mostrar: 0.0.0.0:443

# 3. Verificar certificado SSL instalado
sudo certbot certificates
# Debe mostrar certificado válido

# 4. Test desde Raspberry Pi
curl https://tu-dominio.duckdns.org/health
# Debe funcionar

# 5. Si aún no funciona desde datos móviles, puede ser CG-NAT
# Contacta a tu ISP o considera usar Cloudflare Tunnel
```

**⚠️ Nota sobre CG-NAT:**
Algunos ISPs usan CG-NAT (Carrier-Grade NAT) que impide port forwarding. Verifica con tu ISP si tienes IP pública real.

**✅ Verificación:**
```bash
# Desconectar WiFi del móvil, usar datos móviles
# Abrir navegador: https://tu-dominio.duckdns.org/health
# Debe cargar y mostrar: {"status":"ok",...}
```

---

### ❌ Error 13: `bash: cd: /home/rober/hevy-mcp/actions-runner: No such file or directory`

**Síntoma:**
```
/home/rober/actions-runner/run-service.sh: línea 2: cd: /home/rober/hevy-mcp/actions-runner: No existe el fichero o el directorio
```

**Causa:**
El script `run-service.sh` tiene una ruta incorrecta. Esto pasa cuando moviste el runner pero no actualizaste el script.

**Solución:**
```bash
# 1. Verificar ubicación real del runner
ls -la ~/actions-runner/
# Debe existir el directorio

# 2. Editar run-service.sh
nano ~/actions-runner/run-service.sh

# Debe contener (con la ruta CORRECTA):
#!/bin/bash
cd /home/rober/actions-runner  # ← Verificar esta línea
rm -f package.json package-lock.json
export NODE_OPTIONS="--no-experimental-detect-module"
exec ./runsvc.sh

# 3. Guardar y reiniciar servicio
sudo systemctl restart actions.runner.*.service
```

**✅ Verificación:**
```bash
sudo systemctl status actions.runner.*.service
# Debe mostrar: Active: active (running)
# NO debe mostrar error de "No such file or directory"
```

---

## 🎯 Resumen de Prevención de Errores

### ✅ Checklist para evitar los 13 errores más comunes:

1. ✅ **Runner location:** `~/actions-runner/` (NO `~/hevy-mcp/actions-runner/`)
2. ✅ **PM2 script:** `dist/simple-server.js` (NO `dist/index.js`)
3. ✅ **API Key:** Definida en `ecosystem.config.cjs` (NO solo en `.env`)
4. ✅ **Nginx default:** Eliminado (`sudo rm /etc/nginx/sites-enabled/default`)
5. ✅ **Port forwarding:** Puertos 80 Y 443 configurados
6. ✅ **DuckDNS:** Script probado, muestra `OK`
7. ✅ **SSL:** Solo después de que HTTP funcione
8. ✅ **GitHub PAT:** Con scope `workflow` si modificas `.github/workflows/`
9. ✅ **Wrapper script:** Con `NODE_OPTIONS` y ruta correcta
10. ✅ **IP estática:** Configurada en Raspberry Pi
11. ✅ **PM2 startup:** Configurado y guardado
12. ✅ **Runner service:** Usando wrapper, no `runsvc.sh` directo
13. ✅ **Tests antes de deploy:** Verificar cada paso

---

**Última actualización:** 6 de diciembre de 2025  
**Tiempo estimado:** 45 minutos  
**Nivel de dificultad:** ⭐⭐☆☆☆ (Principiante-Intermedio)

