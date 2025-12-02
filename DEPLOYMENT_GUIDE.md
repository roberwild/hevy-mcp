# 🚀 Guía de Deployment - Hevy MCP en Raspberry Pi

## 📋 Información del Servidor

### 🌐 URLs de Acceso

- **Dominio**: https://hevy-rober.duckdns.org
- **Health Check**: https://hevy-rober.duckdns.org/health
- **Endpoint MCP**: https://hevy-rober.duckdns.org/mcp
- **IP Pública**: 79.112.13.108
- **IP Local**: 192.168.1.210

### 🔑 Credenciales y Configuración

- **Usuario SSH**: rober
- **Hostname**: RASPBERRY-ROBER
- **Puerto SSH**: 22
- **DuckDNS Domain**: hevy-rober.duckdns.org
- **DuckDNS Token**: 7ec14263-b1a3-46bf-b30b-65d00847082b

### 📦 Software Instalado

- **Sistema Operativo**: Raspberry Pi OS Lite (64-bit)
- **Node.js**: v24.11.1 (via NVM)
- **PM2**: Gestor de procesos
- **Nginx**: Reverse proxy
- **Certbot**: Certificados SSL (Let's Encrypt)
- **DuckDNS**: DNS dinámico

---

## 🔄 Actualizar el Servidor

### Método 1: Script Automático (Recomendado) ⭐

#### Paso 1: Crear el script de actualización

En la Raspberry Pi, ejecuta:

```bash
nano ~/hevy-mcp/update.sh
```

Contenido del script:

```bash
#!/bin/bash

echo "🔄 Actualizando Hevy MCP Server..."

# Ir al directorio del proyecto
cd ~/hevy-mcp

# Guardar cambios locales si los hay
git stash

# Obtener últimos cambios
echo "📥 Descargando últimos cambios..."
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
echo "✅ Actualización completada"
pm2 status

# Mostrar logs
echo ""
echo "📋 Últimos logs:"
pm2 logs hevy-mcp --lines 10 --nostream
```

Dar permisos de ejecución:

```bash
chmod +x ~/hevy-mcp/update.sh
```

#### Paso 2: Usar el script

Desde tu PC (después de hacer push a GitHub):

```bash
# 1. Conectar por SSH
ssh rober@raspberry-rober

# 2. Ejecutar script de actualización
~/hevy-mcp/update.sh

# 3. Desconectar
exit
```

**Tiempo total: ~30 segundos** ⚡

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

## 💰 Costos

### Electricidad

- **Consumo**: ~5-8W
- **24h × 30 días × 0.008 kW × €0.15/kWh**
- **Total**: ~€0.87/mes ☕

---

## 🎯 Checklist de Deployment

Antes de hacer push a producción:

- [ ] Código funciona localmente
- [ ] `npm run build` funciona sin errores
- [ ] Commit y push a GitHub
- [ ] SSH a Raspberry Pi
- [ ] Ejecutar `~/hevy-mcp/update.sh`
- [ ] Verificar logs: `pm2 logs hevy-mcp`
- [ ] Probar health: `curl http://localhost:3000/health`
- [ ] Probar desde Internet: https://hevy-rober.duckdns.org/health
- [ ] Probar GPT con una pregunta

---

**Última actualización**: 2 de Diciembre de 2025  
**Versión del servidor**: hevy-mcp v1.10.7  
**Autor**: Rober - Deployment en Raspberry Pi 5

