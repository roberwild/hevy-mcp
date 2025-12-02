# 🚀 Guía de Deployment - Hevy MCP en Raspberry Pi

## 📋 Información del Servidor

### 🌐 URLs de Acceso

- **Dominio**: https://hevy-rober.duckdns.org
- **Health Check**: https://hevy-rober.duckdns.org/health
- **Endpoint MCP**: https://hevy-rober.duckdns.org/mcp
- **IP Pública**: 79.112.13.108
- **IP Local Raspberry**: 192.168.1.141

### 🔑 Credenciales y Configuración

- **Usuario SSH**: rober
- **Hostname**: RASPBERRY-ROBER
- **Puerto SSH**: 22
- **DuckDNS Domain**: hevy-rober.duckdns.org
- **DuckDNS Token**: 7ec14263-b1a3-46bf-b30b-65d00847082b
- **Router**: DIGI (puertos 80 y 443 reenviados)

### 📦 Software Instalado

- **Sistema Operativo**: Raspberry Pi OS Lite (64-bit)
- **Node.js**: v24.11.1 (via NVM)
- **PM2**: v6.0.14 - Gestor de procesos
- **Nginx**: Reverse proxy
- **Certbot**: Certificados SSL (Let's Encrypt)
- **DuckDNS**: DNS dinámico (actualización cada 5 min vía cron)
- **Git**: Control de versiones

---

## 🔄 Actualizar el Servidor

### 📌 Flujo Completo de Actualización

```
Tu PC (Desarrollo) 
    ↓ git push
GitHub (Repositorio)
    ↓ git pull
Raspberry Pi (Producción)
    ↓ npm run build
Servidor Actualizado ✅
```

---

### Método 1: Script Automático (Recomendado) ⭐

**Ya está configurado y listo para usar.**

#### Uso Rápido:

```bash
# 1. Desde tu PC, después de hacer cambios
git add .
git commit -m "Nueva funcionalidad"
git push origin main

# 2. Conectar a Raspberry Pi
ssh rober@192.168.1.141

# 3. Ejecutar script de actualización
~/hevy-mcp/update.sh

# 4. Desconectar
exit
```

**Tiempo total: ~30-60 segundos** ⚡

#### El script hace automáticamente:

1. ✅ Guarda cambios locales (git stash)
2. ✅ Descarga últimos cambios (git pull)
3. ✅ Instala nuevas dependencias (npm install)
4. ✅ Compila el proyecto (npm run build)
5. ✅ Reinicia el servidor (pm2 restart)
6. ✅ Muestra el estado y logs

---

### Método 2: Manual (Para aprender el proceso)

```bash
# 1. Conectar por SSH
ssh rober@192.168.1.141

# 2. Ir al directorio del proyecto
cd ~/hevy-mcp

# 3. Descargar cambios
git pull origin main

# 4. Instalar dependencias (si hay nuevas)
npm install

# 5. Compilar
npm run build

# 6. Reiniciar servidor
pm2 restart hevy-mcp

# 7. Verificar que funciona
pm2 logs hevy-mcp --lines 20

# 8. Probar endpoint
curl http://localhost:3000/health

# 9. Salir
exit
```

---

### Método 3: PRO - Con SSH Keys de GitHub (Sin Password) 🔐

Esta es la forma más profesional y segura. **No te pedirá contraseña nunca más.**

#### Paso 1: Generar clave SSH en la Raspberry Pi

```bash
# Conectar a Raspberry Pi
ssh rober@192.168.1.141

# Generar clave SSH (presiona Enter en todo)
ssh-keygen -t ed25519 -C "tu_email@gmail.com"

# Ver la clave pública
cat ~/.ssh/id_ed25519.pub
```

**Copia toda la salida** (empieza con `ssh-ed25519 AAAA...`)

#### Paso 2: Añadir clave a GitHub

1. Ve a GitHub: https://github.com/settings/keys
2. Click en **"New SSH key"**
3. **Title**: `Raspberry Pi - Hevy MCP`
4. **Key**: Pega la clave que copiaste
5. Click en **"Add SSH key"**

#### Paso 3: Configurar Git para usar SSH

```bash
# En la Raspberry Pi, cambiar remote de HTTPS a SSH
cd ~/hevy-mcp
git remote set-url origin git@github.com:TU_USUARIO/hevy-mcp.git

# Verificar que cambió
git remote -v
# Debe mostrar: git@github.com:TU_USUARIO/hevy-mcp.git

# Probar la conexión
ssh -T git@github.com
# Debe decir: "Hi TU_USUARIO! You've successfully authenticated..."
```

#### Paso 4: Primera prueba

```bash
# Hacer un pull de prueba (no pedirá contraseña)
git pull origin main

# Si funciona, ¡ya está! 🎉
```

#### Paso 5: Actualizar el script update.sh (Opcional)

Si quieres, puedes mejorar el script para que sea aún más robusto:

```bash
nano ~/hevy-mcp/update.sh
```

Actualízalo con esta versión mejorada:

```bash
#!/bin/bash

set -e  # Detener si hay algún error

echo "🔄 Actualizando Hevy MCP Server..."
echo "=================================================="

# Ir al directorio del proyecto
cd ~/hevy-mcp

# Verificar que estamos en la rama main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️ No estás en la rama main (estás en: $BRANCH)"
    read -p "¿Continuar de todas formas? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Guardar cambios locales si los hay
echo "💾 Guardando cambios locales..."
git stash

# Obtener últimos cambios
echo "📥 Descargando últimos cambios desde GitHub..."
git pull origin main

# Restaurar cambios locales si los había
git stash pop 2>/dev/null || true

# Instalar dependencias nuevas (si las hay)
echo "📦 Instalando dependencias..."
npm install

# Compilar el proyecto
echo "🏗️ Compilando proyecto..."
npm run build

# Reiniciar servidor con PM2
echo "♻️ Reiniciando servidor..."
pm2 restart hevy-mcp

# Ver estado
echo ""
echo "✅ Actualización completada"
echo "=================================================="
pm2 status

# Mostrar logs
echo ""
echo "📋 Últimos logs:"
pm2 logs hevy-mcp --lines 15 --nostream

echo ""
echo "🌐 Servidor disponible en:"
echo "   - Local: http://localhost:3000/health"
echo "   - Internet: https://hevy-rober.duckdns.org/health"
```

Guardar y salir (Ctrl+O, Enter, Ctrl+X)

---

### 🎯 Ventajas del Método SSH (PRO)

| Característica | HTTPS | SSH |
|---------------|-------|-----|
| Pide contraseña | ✅ Sí | ❌ No |
| Seguridad | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Velocidad | Normal | Más rápido |
| Automatización | Difícil | Fácil |
| Profesional | No | Sí ✅ |

---

## 🔄 Flujo de Trabajo Completo

### Desde Windows (Tu PC de desarrollo)

```bash
# 1. Hacer cambios en el código
# 2. Probar localmente
npm run build

# 3. Subir a GitHub
git add .
git commit -m "Añadida nueva funcionalidad"
git push origin main
```

### En la Raspberry Pi

```bash
# Opción A: Remoto desde tu PC (si tienes SSH configurado)
ssh rober@192.168.1.141 "cd ~/hevy-mcp && ./update.sh"

# Opción B: Conectándote manualmente
ssh rober@192.168.1.141
~/hevy-mcp/update.sh
exit
```

### Verificación

```bash
# Desde cualquier lugar del mundo
curl https://hevy-rober.duckdns.org/health

# O abre el navegador
https://hevy-rober.duckdns.org/health

# O pregúntale a tu GPT
"¿Estás conectado al servidor?"
```

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico Completo

```
Internet (Cualquier lugar del mundo)
    ↓ HTTPS (puerto 443)
Router DIGI (79.112.13.108)
    ↓ Port Forwarding (443 → 192.168.1.141:443)
Nginx (Reverse Proxy)
    ↓ HTTP (localhost:3000)
PM2 (Process Manager)
    ↓ Gestiona procesos Node.js
Hevy MCP Server (Node.js)
    ↓ API REST
Hevy API (api.hevyapp.com)
```

### Componentes Clave

#### 1. **DuckDNS** (DNS Dinámico)
- Actualiza automáticamente tu IP pública cada 5 minutos
- Script: `~/duckdns/duck.sh`
- Cron: `*/5 * * * * ~/duckdns/duck.sh`
- Dominio: `hevy-rober.duckdns.org`

#### 2. **Nginx** (Reverse Proxy)
- Recibe peticiones HTTPS del exterior
- Redirige a Node.js en puerto 3000
- Maneja certificados SSL
- Config: `/etc/nginx/sites-available/hevy-mcp`

#### 3. **Let's Encrypt** (Certificados SSL)
- Certificados válidos por 90 días
- Renovación automática con Certbot
- Ubicación: `/etc/letsencrypt/live/hevy-rober.duckdns.org/`

#### 4. **PM2** (Gestor de Procesos)
- Mantiene el servidor siempre activo
- Reinicia automáticamente si hay crash
- Logs centralizados
- Config: `~/hevy-mcp/ecosystem.config.cjs`

#### 5. **Node.js** (Runtime)
- Versión: v24.11.1
- Gestionado por NVM
- TypeScript compilado a JavaScript

#### 6. **Hevy MCP Server** (Tu Aplicación)
- Puerto: 3000
- Endpoints: `/health`, `/mcp`
- API Key: Configurada en `ecosystem.config.cjs`

---

## 📚 Métodos Disponibles en el Servidor

### Métodos de Entrenamientos (Workouts)

#### `getLastWorkouts`
Obtiene los últimos N entrenamientos.

```json
{
  "method": "getLastWorkouts",
  "params": {
    "count": 3
  }
}
```

#### `getWorkouts`
Obtiene entrenamientos con paginación.

```json
{
  "method": "getWorkouts",
  "params": {
    "page": 1,
    "pageSize": 5
  }
}
```

#### `searchWorkouts` ✨ NUEVO
Busca entrenamientos por título o descripción.

```json
{
  "method": "searchWorkouts",
  "params": {
    "query": "VivaGym"
  }
}
```

**Ejemplo de respuesta:**
```json
{
  "workouts": [...],
  "totalCount": 2,
  "searchQuery": "VivaGym",
  "message": "✅ Encontrados 2 entrenamientos que contienen \"VivaGym\""
}
```

### Métodos de Rutinas (Routines)

#### `getRoutines`
Obtiene rutinas con paginación.

#### `createRoutine`
Crea una nueva rutina.

#### `updateRoutine`
Actualiza una rutina existente.

#### `getRoutineDetails`
Obtiene detalles de una rutina específica.

#### `addExerciseToRoutine`
Añade un ejercicio a una rutina existente.

### Métodos de Ejercicios (Exercise Templates)

#### `getExerciseTemplates`
Obtiene plantillas de ejercicios.

#### `searchExerciseTemplates`
Busca ejercicios por nombre (con fuzzy matching en español).

#### `getExerciseTemplate`
Obtiene detalles de un ejercicio específico.

### Métodos de Carpetas (Routine Folders)

#### `getRoutineFolders`
Obtiene las carpetas de rutinas.

---

## 🛠️ Comandos Útiles

### Gestión del Servidor

```bash
# Ver estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs hevy-mcp

# Reiniciar servidor
pm2 restart hevy-mcp

# Detener servidor
pm2 stop hevy-mcp

# Ver uso de recursos
pm2 monit

# Guardar configuración de PM2
pm2 save
```

### Gestión de Nginx

```bash
# Verificar configuración
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx

# Recargar configuración (sin downtime)
sudo systemctl reload nginx

# Ver estado
sudo systemctl status nginx

# Ver logs de errores
sudo tail -f /var/log/nginx/error.log

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log
```

### Gestión de Certificados SSL

```bash
# Ver certificados instalados
sudo certbot certificates

# Renovar certificados manualmente
sudo certbot renew

# Test de renovación (sin hacer nada)
sudo certbot renew --dry-run
```

### Sistema

```bash
# Ver temperatura de la Raspberry Pi
vcgencmd measure_temp

# Ver uso de memoria
free -h

# Ver espacio en disco
df -h

# Ver procesos
htop

# Reiniciar Raspberry Pi
sudo reboot
```

---

## 🐛 Troubleshooting

### El servidor no arranca

```bash
# Ver logs de errores
pm2 logs hevy-mcp --err --lines 50

# Reiniciar desde cero
pm2 delete hevy-mcp
pm2 start ecosystem.config.cjs
pm2 save
```

### Nginx da error 502 Bad Gateway

```bash
# Verificar que el servidor esté corriendo
pm2 status

# Verificar que está en el puerto correcto
sudo netstat -tlnp | grep :3000

# Ver logs de nginx
sudo tail -f /var/log/nginx/error.log
```

### Puerto 3000 ocupado

```bash
# Ver qué está usando el puerto
sudo netstat -tlnp | grep :3000

# Matar el proceso (reemplaza PID)
kill -9 <PID>

# O detener todos los procesos de PM2
pm2 delete all
```

---

## 🧪 Testing y Verificación

### Test Local (en la Raspberry Pi)

```bash
# 1. Health Check
curl http://localhost:3000/health

# 2. Test método help
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"help","id":1}'

# 3. Test getLastWorkouts
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"getLastWorkouts","params":{"count":1},"id":1}'

# 4. Test searchWorkouts (NUEVO)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"searchWorkouts","params":{"query":"VivaGym"},"id":1}'
```

### Test Remoto (desde Internet)

```bash
# Desde tu PC o cualquier dispositivo

# 1. Health Check
curl https://hevy-rober.duckdns.org/health

# 2. Test con GPT
# Abre ChatGPT y pregunta:
# "¿Cuántos entrenamientos tengo en VivaGym de Ferrol?"
```

### Test desde Navegador

Abre estas URLs en tu navegador:

- Health: https://hevy-rober.duckdns.org/health
- Debe mostrar: `{"status":"ok","message":"Hevy MCP Server is running"...}`

### Verificar SSL/HTTPS

```bash
# Ver certificado
openssl s_client -connect hevy-rober.duckdns.org:443 -servername hevy-rober.duckdns.org

# O visita en navegador y mira el candado 🔒
```

---

## 💰 Costos y Sostenibilidad

### 💡 Electricidad

- **Consumo Raspberry Pi**: ~5-8W (con WiFi y carga moderada)
- **Cálculo**: 24h × 30 días × 0.008 kW × €0.15/kWh
- **Total**: **~€0.87/mes** ☕
- **Anual**: **~€10.44/año**

### 🆓 Servicios Gratuitos

- ✅ DuckDNS: Gratis para siempre
- ✅ Let's Encrypt: Gratis para siempre
- ✅ GitHub: Gratis (repositorios públicos)
- ✅ Nginx: Open source gratuito
- ✅ Node.js: Open source gratuito
- ✅ PM2: Open source gratuito

### 💵 Comparación con Servicios Cloud

| Servicio | Costo Mensual | Costo Anual |
|----------|---------------|-------------|
| **Raspberry Pi** | €0.87 | €10.44 |
| Heroku Hobby | €7 | €84 |
| DigitalOcean Droplet | €6 | €72 |
| AWS EC2 t2.micro | €8.50 | €102 |
| Railway Hobby | $5 | ~€57 |

**Ahorro anual: ~€60-90** 💰

---

## 🎯 Checklist de Deployment

### Antes de hacer push a producción:

- [ ] ✅ Código funciona localmente
- [ ] ✅ `npm run build` sin errores
- [ ] ✅ Tests pasan correctamente
- [ ] ✅ Commit con mensaje descriptivo
- [ ] ✅ Push a GitHub

### Proceso de actualización:

- [ ] ✅ SSH a Raspberry Pi
- [ ] ✅ Ejecutar `~/hevy-mcp/update.sh`
- [ ] ✅ Verificar logs: `pm2 logs hevy-mcp`
- [ ] ✅ Test local: `curl http://localhost:3000/health`
- [ ] ✅ Test remoto: `curl https://hevy-rober.duckdns.org/health`
- [ ] ✅ Probar GPT con una pregunta

### Si algo falla:

- [ ] ✅ Ver logs de errores: `pm2 logs hevy-mcp --err`
- [ ] ✅ Ver logs de nginx: `sudo tail -f /var/log/nginx/error.log`
- [ ] ✅ Verificar puerto 3000: `sudo netstat -tlnp | grep :3000`
- [ ] ✅ Reiniciar PM2: `pm2 restart hevy-mcp`
- [ ] ✅ Reiniciar Nginx: `sudo systemctl restart nginx`

---

## 🔐 Seguridad

### Implementado

- ✅ **HTTPS** con certificados Let's Encrypt
- ✅ **API Key** requerida para Hevy API
- ✅ **SSH** para acceso remoto (puerto 22)
- ✅ **Firewall** del router (solo puertos 80 y 443 abiertos)
- ✅ **PM2** ejecuta el proceso sin privilegios de root
- ✅ **Nginx** como proxy (no expone Node.js directamente)

### Recomendaciones Adicionales (Opcional)

#### 1. Cambiar puerto SSH (evitar bots)

```bash
sudo nano /etc/ssh/sshd_config
# Cambiar: Port 22 → Port 2222
sudo systemctl restart sshd
```

#### 2. Fail2ban (bloquear intentos de login)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 3. Rate limiting en Nginx

```bash
sudo nano /etc/nginx/sites-available/hevy-mcp
```

Añadir al inicio del archivo:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    # ... configuración existente ...
    
    location /mcp {
        limit_req zone=api_limit burst=20 nodelay;
        # ... resto de configuración ...
    }
}
```

#### 4. Actualizar sistema regularmente

```bash
# Crear script de actualización
echo '#!/bin/bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
' > ~/update-system.sh

chmod +x ~/update-system.sh

# Ejecutar mensualmente
sudo crontab -e
# Añadir: 0 3 1 * * /home/rober/update-system.sh
```

---

## 📊 Monitoreo y Mantenimiento

### Logs a revisar regularmente

```bash
# Logs de la aplicación
pm2 logs hevy-mcp

# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs del sistema
journalctl -xe

# Uso de recursos
htop
```

### Métricas importantes

```bash
# CPU y memoria del servidor
pm2 monit

# Temperatura de la Raspberry Pi
vcgencmd measure_temp

# Espacio en disco
df -h

# Uptime del sistema
uptime
```

### Backups (Recomendado)

```bash
# Backup del proyecto
cd ~
tar -czf hevy-mcp-backup-$(date +%Y%m%d).tar.gz hevy-mcp/

# Backup de configuración de Nginx
sudo cp /etc/nginx/sites-available/hevy-mcp ~/nginx-hevy-mcp-backup.conf

# Backup de PM2
pm2 save
cp ~/.pm2/dump.pm2 ~/pm2-backup.json
```

---

## 🆘 Soporte y Referencias

### Documentación Oficial

- **Hevy API**: https://github.com/TU_USUARIO/hevy-mcp
- **PM2**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **DuckDNS**: https://www.duckdns.org/spec.jsp
- **Node.js**: https://nodejs.org/en/docs/

### Comandos de Emergencia

```bash
# El servidor no responde
pm2 restart hevy-mcp

# PM2 está roto
pm2 kill
pm2 resurrect

# Nginx no funciona
sudo systemctl restart nginx

# Reiniciar todo
sudo reboot

# Ver qué está usando el puerto 3000
sudo lsof -i :3000

# Matar proceso específico
kill -9 <PID>
```

---

## 📝 Notas Finales

### Lo que has logrado

1. ✅ **Servidor en producción** con tu propia infraestructura
2. ✅ **HTTPS** configurado y funcionando
3. ✅ **Dominio personalizado** con DuckDNS
4. ✅ **Actualización automática** con script
5. ✅ **Integración con GPT** completamente funcional
6. ✅ **Alta disponibilidad** con PM2
7. ✅ **Costos mínimos** (~€1/mes de electricidad)
8. ✅ **Control total** de tu infraestructura

### Próximos pasos sugeridos

- 🔜 Configurar SSH keys para no usar password (Método PRO)
- 🔜 Añadir más métodos al servidor según necesites
- 🔜 Implementar rate limiting para proteger la API
- 🔜 Configurar alertas si el servidor cae
- 🔜 Añadir analytics/métricas de uso

---

## 🎓 Aprendizajes Técnicos

Durante este proyecto has trabajado con:

- ✅ Linux (Raspberry Pi OS)
- ✅ SSH y administración remota
- ✅ Node.js y TypeScript
- ✅ Git y GitHub
- ✅ Nginx (reverse proxy)
- ✅ SSL/TLS y certificados
- ✅ DNS dinámico
- ✅ Port forwarding y NAT
- ✅ Process managers (PM2)
- ✅ Deployment y DevOps
- ✅ APIs REST
- ✅ Integración con IA (GPT)

**¡Todo un stack completo de producción!** 🚀

---

**Última actualización**: 2 de Diciembre de 2025  
**Versión del servidor**: hevy-mcp v1.10.7  
**Autor**: Rober  
**Hardware**: Raspberry Pi (RASPBERRY-ROBER)  
**Dominio**: https://hevy-rober.duckdns.org  

---

**¿Preguntas o problemas?**  
Revisa la sección de Troubleshooting o los logs con `pm2 logs hevy-mcp`

