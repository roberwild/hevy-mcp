# 🚀 Sistema de Auto-Deploy Completado - Raspberry Pi

> **Estado:** ✅ **FUNCIONANDO AL 100%**  
> **Última verificación:** 6 de diciembre de 2025  
> **Deployments exitosos:** Múltiples (confirmado con timestamps)

---

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Arquitectura](#arquitectura)
3. [Componentes Instalados](#componentes-instalados)
4. [Flujo de Deployment](#flujo-de-deployment)
5. [Verificación del Sistema](#verificación-del-sistema)
6. [Cómo Hacer un Deploy](#cómo-hacer-un-deploy)
7. [Troubleshooting](#troubleshooting)
8. [Mantenimiento](#mantenimiento)

---

## 🎯 Resumen del Sistema

### ¿Qué hace?

Cuando haces `git push` a GitHub:
1. **GitHub Actions** detecta el push automáticamente
2. **Self-Hosted Runner** (en la Raspberry Pi) ejecuta el workflow
3. El código se descarga, compila e instala en la Raspberry Pi
4. **PM2** reinicia el servidor automáticamente
5. **Nginx** sirve la aplicación con HTTPS
6. ¡**Todo en menos de 30 segundos**!

### Características

- ✅ **Zero-downtime deployment** - El servidor se reinicia instantáneamente
- ✅ **Auto-start on boot** - Todo arranca automáticamente si se reinicia la Raspberry Pi
- ✅ **HTTPS seguro** - Certificados SSL de Let's Encrypt renovados automáticamente
- ✅ **Sin SSH externo** - El runner corre localmente en la Raspberry Pi
- ✅ **Health checks** - Verifica que el deployment funcionó correctamente

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
│                            ↓                                     │
│                   https://hevy-rober.duckdns.org                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTER (Puerto 443)                         │
│                    Port Forwarding → 192.168.1.210:443          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RASPBERRY PI (192.168.1.210)                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ NGINX (Puerto 443)                                      │    │
│  │ - Termina SSL/HTTPS                                     │    │
│  │ - Proxy reverso → localhost:3000                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ PM2 (Process Manager)                                   │    │
│  │ - Ejecuta: node dist/simple-server.js                   │    │
│  │ - Auto-restart si falla                                 │    │
│  │ - Auto-start on boot (systemd)                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ HEVY-MCP Server (Node.js - Puerto 3000)                │    │
│  │ - API para GPT                                          │    │
│  │ - Hevy fitness data integration                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ GitHub Actions Runner (systemd service)                 │    │
│  │ - Escucha eventos de GitHub                             │    │
│  │ - Ejecuta deployments automáticamente                   │    │
│  │ - Ubicación: ~/actions-runner/                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                              ↑                                   │
└──────────────────────────────┼───────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│                         GITHUB                                   │
│  - Repositorio: roberwild/hevy-mcp                              │
│  - Workflow: .github/workflows/deploy.yml                       │
│  - Trigger: push to main branch                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Instalados

### 1. **GitHub Actions Self-Hosted Runner**

**Ubicación:** `~/actions-runner/`

**Servicio systemd:** `actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service`

**Script wrapper:** `~/actions-runner/run-service.sh`

```bash
#!/bin/bash
cd /home/rober/actions-runner
rm -f package.json package-lock.json
export NODE_OPTIONS="--no-experimental-detect-module"
exec ./runsvc.sh
```

**¿Por qué el wrapper?**
- Evita conflictos con el `package.json` del proyecto principal
- Previene errores de ES modules en el runner de Node.js v20

**Estado del servicio:**
```bash
sudo systemctl status actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service
```

**Logs:**
```bash
journalctl -u actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service -f
```

---

### 2. **PM2 (Process Manager)**

**Configuración:** `ecosystem.config.cjs`

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
      HEVY_API_KEY: '39a9b904-02e7-451b-96d9-6996e34637c7'
    }
  }]
};
```

**Comandos útiles:**
```bash
pm2 status              # Ver estado
pm2 logs hevy-mcp       # Ver logs en tiempo real
pm2 restart hevy-mcp    # Reiniciar servidor
pm2 stop hevy-mcp       # Detener servidor
pm2 start hevy-mcp      # Iniciar servidor
```

---

### 3. **Nginx (Reverse Proxy + SSL)**

**Configuración:** `/etc/nginx/sites-available/hevy-mcp`

```nginx
server {
    server_name hevy-rober.duckdns.org _;

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

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/hevy-rober.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hevy-rober.duckdns.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = hevy-rober.duckdns.org) {
        return 301 https://$host$request_uri;
    }

    listen 80 default_server;
    server_name hevy-rober.duckdns.org _;
    return 404;
}
```

**Comandos útiles:**
```bash
sudo nginx -t                    # Verificar configuración
sudo systemctl restart nginx     # Reiniciar Nginx
sudo systemctl status nginx      # Ver estado
```

---

### 4. **DuckDNS (Dynamic DNS)**

**Script:** `~/duckdns/duck.sh`

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=hevy-rober&token=7ec14263-b1a3-46bf-b30b-65d00847082b&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

**Cron job (actualiza cada 5 minutos):**
```bash
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

**Verificar actualización:**
```bash
cat ~/duckdns/duck.log
# Debe mostrar: OK
```

---

### 5. **Let's Encrypt (SSL Certificates)**

**Certificados:** `/etc/letsencrypt/live/hevy-rober.duckdns.org/`

**Renovación automática:** Certbot tiene un timer systemd que renueva automáticamente

**Renovar manualmente:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 🔄 Flujo de Deployment

### Paso a Paso

```
1. DEV MACHINE (Windows)
   ├─ Editas código
   ├─ git add .
   ├─ git commit -m "mensaje"
   └─ git push origin main
          │
          ↓
2. GITHUB
   ├─ Detecta push a main
   ├─ Ejecuta workflow: .github/workflows/deploy.yml
   └─ Envía job al self-hosted runner
          │
          ↓
3. RASPBERRY PI - RUNNER SERVICE
   ├─ Recibe job de GitHub
   ├─ Ejecuta pasos del workflow:
   │  ├─ git pull origin main
   │  ├─ npm install
   │  ├─ npm run build
   │  ├─ pm2 restart hevy-mcp
   │  └─ health checks
   └─ Reporta resultado a GitHub
          │
          ↓
4. RASPBERRY PI - SERVER
   ├─ PM2 reinicia el servidor
   ├─ Servidor carga nuevo código
   └─ Responde a health checks
          │
          ↓
5. RESULTADO
   ├─ GitHub muestra ✅ deploy exitoso
   ├─ Servidor actualizado en producción
   └─ Accesible vía https://hevy-rober.duckdns.org
```

---

## ✅ Verificación del Sistema

### Verificación Completa en Raspberry Pi

```bash
# 1. Verificar que el runner está corriendo
sudo systemctl status actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service

# Debe mostrar: Active: active (running)

# 2. Verificar que PM2 está corriendo el servidor
pm2 status

# Debe mostrar: hevy-mcp │ online

# 3. Ver logs del servidor
pm2 logs hevy-mcp --lines 20 --nostream

# Debe mostrar:
# ✨ AUTO-DEPLOY FUNCIONANDO
# 🎯 Deploy con Self-Hosted Runner
# 🔥 Servicio systemd configurado
# 🎯 Última actualización: [timestamp reciente]

# 4. Verificar health endpoint localmente
curl http://localhost:3000/health

# Debe responder: {"status":"ok","timestamp":"..."}

# 5. Verificar desde internet
curl https://hevy-rober.duckdns.org/health

# Debe responder: {"status":"ok","timestamp":"..."}

# 6. Verificar Nginx
sudo systemctl status nginx

# Debe mostrar: Active: active (running)

# 7. Verificar certificados SSL
sudo certbot certificates

# Debe mostrar: hevy-rober.duckdns.org con fecha de expiración válida

# 8. Verificar DuckDNS
cat ~/duckdns/duck.log

# Debe mostrar: OK
```

### Verificación desde Windows

```bash
# 1. Ver último workflow en GitHub
# https://github.com/roberwild/hevy-mcp/actions

# 2. Probar el endpoint
curl https://hevy-rober.duckdns.org/health

# 3. Probar desde el navegador
# https://hevy-rober.duckdns.org/health
```

---

## 🚀 Cómo Hacer un Deploy

### Método 1: Deploy Normal (Desarrollo)

```bash
# En tu máquina Windows (VSCode/Terminal)

# 1. Hacer cambios en el código
# 2. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 3. Ver progreso en GitHub Actions
# https://github.com/roberwild/hevy-mcp/actions

# 4. Esperar ~30 segundos
# 5. ¡Listo! Tu código está en producción
```

### Método 2: Deploy Urgente (Hotfix)

```bash
# Si necesitas deployar INMEDIATAMENTE

# Opción A: Push directo
git add .
git commit -m "hotfix: error crítico"
git push origin main

# Opción B: Deployment manual en Raspberry Pi (si GitHub está caído)
ssh rober@192.168.1.210
cd ~/hevy-mcp
git pull origin main
npm install
npm run build
pm2 restart hevy-mcp
```

### Método 3: Rollback (Volver a versión anterior)

```bash
# En Raspberry Pi via SSH
ssh rober@192.168.1.210
cd ~/hevy-mcp

# Ver commits recientes
git log --oneline -n 10

# Volver a un commit específico
git checkout <commit-hash>
npm install
npm run build
pm2 restart hevy-mcp

# Volver a la última versión
git checkout main
git pull origin main
npm install
npm run build
pm2 restart hevy-mcp
```

---

## 🔧 Troubleshooting

### Problema 1: Workflow falla en GitHub

**Síntoma:** GitHub Actions muestra error rojo

**Diagnóstico:**
```bash
# En Raspberry Pi
# 1. Ver logs del runner
journalctl -u actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service -n 50

# 2. Ver estado del servicio
sudo systemctl status actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service
```

**Soluciones:**

a) **Runner no está corriendo**
```bash
sudo systemctl start actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service
sudo systemctl enable actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service
```

b) **Error de ES modules**
```bash
# Verificar que run-service.sh existe y tiene contenido correcto
cat ~/actions-runner/run-service.sh

# Debe contener:
# cd /home/rober/actions-runner
# rm -f package.json package-lock.json
# export NODE_OPTIONS="--no-experimental-detect-module"
# exec ./runsvc.sh
```

c) **Error de permisos**
```bash
chmod +x ~/actions-runner/run-service.sh
```

---

### Problema 2: Servidor no responde después del deploy

**Síntoma:** Health check falla, `curl https://hevy-rober.duckdns.org/health` no responde

**Diagnóstico:**
```bash
# 1. Ver estado de PM2
pm2 status

# 2. Ver logs del servidor
pm2 logs hevy-mcp --lines 50

# 3. Verificar que el puerto 3000 está escuchando
sudo netstat -tlnp | grep :3000

# 4. Ver estado de Nginx
sudo systemctl status nginx
```

**Soluciones:**

a) **PM2 no está corriendo**
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

b) **Error en el código (servidor crashea)**
```bash
# Ver logs completos
pm2 logs hevy-mcp

# Si hay error de compilación
npm run build

# Si falta HEVY_API_KEY
# Editar ecosystem.config.cjs y asegurar que está la API key
pm2 restart hevy-mcp
```

c) **Nginx no está corriendo**
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### Problema 3: HTTPS no funciona

**Síntoma:** `ERR_CONNECTION_REFUSED` o `ERR_SSL_PROTOCOL_ERROR`

**Diagnóstico:**
```bash
# 1. Verificar certificados
sudo certbot certificates

# 2. Ver configuración de Nginx
sudo nginx -t

# 3. Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

**Soluciones:**

a) **Certificados expirados**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

b) **Configuración de Nginx incorrecta**
```bash
# Restaurar configuración correcta
sudo nano /etc/nginx/sites-available/hevy-mcp
# Copiar configuración de este documento
sudo nginx -t
sudo systemctl reload nginx
```

c) **Puerto 443 bloqueado en router**
- Verificar port forwarding en el router
- Puerto externo: 443 → IP interna: 192.168.1.210 → Puerto interno: 443

---

### Problema 4: DuckDNS no actualiza la IP

**Síntoma:** Dominio apunta a IP incorrecta

**Diagnóstico:**
```bash
# Ver último resultado
cat ~/duckdns/duck.log

# Ver cron jobs
crontab -l
```

**Soluciones:**

a) **Script no se ejecuta**
```bash
# Ejecutar manualmente
~/duckdns/duck.sh

# Ver resultado
cat ~/duckdns/duck.log
# Debe mostrar: OK
```

b) **Cron job no configurado**
```bash
crontab -e
# Agregar:
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

c) **Token incorrecto**
```bash
# Verificar token en https://www.duckdns.org
# Editar duck.sh con el token correcto
nano ~/duckdns/duck.sh
```

---

### Problema 5: Servidor no arranca después de reiniciar Raspberry Pi

**Síntoma:** Después de `sudo reboot`, el servidor no está disponible

**Diagnóstico:**
```bash
# Verificar servicios
sudo systemctl status actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service
pm2 status
sudo systemctl status nginx
```

**Soluciones:**

a) **PM2 no configurado para auto-start**
```bash
pm2 startup
# Ejecutar el comando que PM2 sugiere (sudo env PATH=...)
pm2 save
```

b) **Runner no configurado para auto-start**
```bash
sudo systemctl enable actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service
```

c) **Nginx no configurado para auto-start**
```bash
sudo systemctl enable nginx
```

---

## 🔒 Seguridad

### Credenciales y Secretos

**⚠️ NUNCA commitear estos archivos:**
- `.env` - Contiene `HEVY_API_KEY`
- `ecosystem.config.cjs` - Contiene API key en texto plano
- `~/duckdns/duck.sh` - Contiene token de DuckDNS

**✅ Protección:**
```bash
# En .gitignore ya están incluidos:
.env
ecosystem.config.cjs
*.log
```

### Puertos Expuestos

- **80 (HTTP):** Redirige a HTTPS
- **443 (HTTPS):** Único puerto accesible desde internet
- **3000 (Node.js):** Solo accesible localmente (localhost)

### Firewall (Opcional pero recomendado)

```bash
# Instalar ufw
sudo apt install ufw

# Configurar reglas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Habilitar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

---

## 🔄 Mantenimiento

### Tareas Diarias (Automáticas)

✅ **DuckDNS actualiza IP cada 5 minutos**  
✅ **GitHub Actions detecta pushes automáticamente**  
✅ **PM2 reinicia servidor si crashea**  
✅ **Nginx sirve peticiones 24/7**

### Tareas Mensuales (Manuales opcionales)

```bash
# 1. Ver logs del sistema
journalctl --since "1 month ago" | grep error

# 2. Verificar espacio en disco
df -h

# 3. Ver uptime del servidor
pm2 status
# Mirar la columna "uptime"

# 4. Ver logs de deployments recientes
journalctl -u actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service --since "1 month ago"
```

### Tareas Trimestrales

```bash
# 1. Actualizar sistema operativo
sudo apt update
sudo apt upgrade -y
sudo reboot

# 2. Actualizar Node.js (si hay nueva versión LTS)
nvm install --lts
nvm use --lts
npm install -g pm2

# 3. Limpiar logs antiguos de PM2
pm2 flush
```

### Backups Recomendados

```bash
# Backup manual (ejecutar desde Raspberry Pi)
cd ~
tar -czf hevy-mcp-backup-$(date +%Y%m%d).tar.gz \
  hevy-mcp/.env \
  hevy-mcp/ecosystem.config.cjs \
  duckdns/duck.sh \
  /etc/nginx/sites-available/hevy-mcp

# Copiar backup a otra máquina
scp hevy-mcp-backup-*.tar.gz usuario@otra-maquina:/ruta/backups/
```

---

## 📊 Monitoreo

### Ver métricas del servidor en tiempo real

```bash
# CPU, RAM, uptime
pm2 monit

# Logs en vivo
pm2 logs hevy-mcp

# Requests en tiempo real (access log de Nginx)
sudo tail -f /var/log/nginx/access.log
```

### Ver histórico de deployments

```bash
# En GitHub
https://github.com/roberwild/hevy-mcp/actions

# En Raspberry Pi (logs del runner)
journalctl -u actions.runner.roberwild-hevy-mcp.raspberry-pi-runner.service | grep "Job Deploy to Production"
```

---

## 🎯 URLs Importantes

- **Producción:** https://hevy-rober.duckdns.org
- **Health Check:** https://hevy-rober.duckdns.org/health
- **GPT Endpoint:** https://hevy-rober.duckdns.org/mcp
- **GitHub Actions:** https://github.com/roberwild/hevy-mcp/actions
- **DuckDNS Panel:** https://www.duckdns.org

---

## 📞 Contacto y Soporte

**Proyecto:** hevy-mcp  
**Repositorio:** https://github.com/roberwild/hevy-mcp  
**Deployment:** Raspberry Pi + GitHub Actions Self-Hosted Runner

---

## 🎉 Conclusión

¡Sistema completamente funcional y automatizado!

**Resumen de lo que logramos:**
- ✅ Auto-deploy desde GitHub a Raspberry Pi sin SSH externo
- ✅ HTTPS seguro con certificados renovados automáticamente
- ✅ Dominio personalizado con DuckDNS
- ✅ Servidor con auto-restart y high availability (PM2)
- ✅ Health checks automatizados en cada deployment
- ✅ Zero-downtime deployments
- ✅ Todo arranca automáticamente después de reiniciar

**Workflow actual:**
```
git push → 30 segundos → Código en producción ✨
```

---

**Última actualización:** 6 de diciembre de 2025  
**Estado del sistema:** 🟢 Operacional

