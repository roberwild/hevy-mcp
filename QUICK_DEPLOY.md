# ⚡ Quick Deploy Guide

## 🚀 Actualizar Servidor (30 segundos)

### Opción 1: Método Rápido (HTTPS)

```bash
ssh rober@192.168.1.141
~/hevy-mcp/update.sh
exit
```

### Opción 2: Método PRO (SSH - Sin Password)

Si ya configuraste SSH keys con GitHub:

```bash
ssh rober@192.168.1.141
cd ~/hevy-mcp
git pull origin main
npm install
npm run build
pm2 restart hevy-mcp
exit
```

**¡Listo! No pide contraseña en el `git pull`** 🎉

---

## 📋 URLs Importantes

| Tipo | URL |
|------|-----|
| **Producción** | https://hevy-rober.duckdns.org |
| **Health Check** | https://hevy-rober.duckdns.org/health |
| **Endpoint MCP** | https://hevy-rober.duckdns.org/mcp |
| **IP Local** | 192.168.1.141 |
| **IP Pública** | 79.112.13.108 |

---

## 🔧 Comandos Rápidos

### PM2 (Gestión del Servidor)

```bash
pm2 status                    # Ver estado
pm2 logs hevy-mcp             # Ver logs en tiempo real
pm2 logs hevy-mcp --lines 50  # Ver últimos 50 logs
pm2 restart hevy-mcp          # Reiniciar servidor
pm2 monit                     # Monitor de recursos
pm2 save                      # Guardar configuración
```

### Git (Actualización Manual)

```bash
cd ~/hevy-mcp
git status                    # Ver estado
git pull origin main          # Descargar cambios
git log --oneline -5          # Ver últimos 5 commits
```

### Sistema

```bash
vcgencmd measure_temp         # Temperatura de la Raspberry Pi
htop                          # Monitor de sistema
df -h                         # Espacio en disco
free -h                       # Memoria RAM
```

### Nginx

```bash
sudo systemctl status nginx   # Estado de Nginx
sudo systemctl restart nginx  # Reiniciar Nginx
sudo nginx -t                 # Test de configuración
sudo tail -f /var/log/nginx/error.log  # Logs de errores
```

---

## 🧪 Tests Rápidos

### Test Local (en Raspberry Pi)

```bash
# Health check
curl http://localhost:3000/health

# Test help
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"help","id":1}'
```

### Test Remoto (desde tu PC)

```bash
# Health check desde Internet
curl https://hevy-rober.duckdns.org/health

# O abre en navegador
# https://hevy-rober.duckdns.org/health
```

---

## 🆕 Métodos Disponibles

### Workouts (Entrenamientos)

- `getLastWorkout` - Último entrenamiento
- `getLastWorkouts` - Últimos N entrenamientos
- `getWorkouts` - Entrenamientos con paginación
- `searchWorkouts` ⭐ **NUEVO** - Buscar por texto

### Routines (Rutinas)

- `getRoutines` - Listar rutinas
- `createRoutine` - Crear rutina
- `updateRoutine` - Actualizar rutina
- `getRoutineDetails` - Detalles de rutina
- `addExerciseToRoutine` - Añadir ejercicio

### Exercises (Ejercicios)

- `getExerciseTemplates` - Listar ejercicios
- `getExerciseTemplate` - Detalles de ejercicio
- `searchExerciseTemplates` - Buscar ejercicios

### Folders (Carpetas)

- `getRoutineFolders` - Listar carpetas

---

## 🎯 Ejemplo: searchWorkouts

### Desde GPT

```
Pregunta: "¿Cuántos entrenamientos he hecho en VivaGym de Ferrol?"
Respuesta: "Has realizado 7 entrenamientos en el VivaGym de Ferrol 🏋️"
```

### Desde cURL

```bash
curl -X POST https://hevy-rober.duckdns.org/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "searchWorkouts",
    "params": {
      "query": "VivaGym"
    },
    "id": 1
  }'
```

### Respuesta

```json
{
  "jsonrpc": "2.0",
  "result": {
    "workouts": [...],
    "totalCount": 7,
    "searchQuery": "VivaGym",
    "message": "✅ Encontrados 7 entrenamientos que contienen \"VivaGym\"",
    "server": "Railway"
  },
  "id": 1
}
```

---

## 🚨 Troubleshooting Express

| Problema | Solución Rápida |
|----------|-----------------|
| Servidor no responde | `pm2 restart hevy-mcp` |
| Error 502 (Bad Gateway) | `pm2 status` + `pm2 restart hevy-mcp` |
| Puerto 3000 ocupado | `sudo netstat -tlnp \| grep :3000` → `pm2 delete all` |
| Git pide password | Configurar SSH keys (ver guía completa) |
| Nginx error | `sudo systemctl restart nginx` |
| Certificado expirado | `sudo certbot renew` |

---

## 📊 Checklist de Deploy

**Antes de actualizar:**

- [ ] ✅ Código testeado localmente
- [ ] ✅ `npm run build` sin errores
- [ ] ✅ `git push origin main` exitoso

**Durante actualización:**

- [ ] ✅ SSH a Raspberry Pi
- [ ] ✅ Ejecutar `~/hevy-mcp/update.sh`
- [ ] ✅ Ver logs sin errores

**Después de actualizar:**

- [ ] ✅ Test local: `curl http://localhost:3000/health`
- [ ] ✅ Test remoto: `curl https://hevy-rober.duckdns.org/health`
- [ ] ✅ Test GPT: Hacer pregunta de prueba

---

## 💡 Tips Pro

### 1. Alias útiles

Añade a `~/.bashrc` en la Raspberry Pi:

```bash
alias pm2l='pm2 logs hevy-mcp'
alias pm2s='pm2 status'
alias pm2r='pm2 restart hevy-mcp'
alias hevy='cd ~/hevy-mcp'
alias update-hevy='cd ~/hevy-mcp && ./update.sh'
```

Recargar: `source ~/.bashrc`

### 2. Actualización en un comando

Desde tu PC Windows:

```bash
ssh rober@192.168.1.141 "cd ~/hevy-mcp && ./update.sh"
```

### 3. Ver logs en tiempo real

```bash
pm2 logs hevy-mcp --lines 100
```

Presiona `Ctrl+C` para salir.

### 4. Configurar SSH Keys

Ver sección "Método 3: PRO" en [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Ventaja**: No pide password nunca más en `git pull` 🔐

---

## 📖 Documentación Completa

Para instrucciones detalladas, arquitectura del sistema, seguridad, y más:

👉 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

## 🎉 Resumen

**Tienes un servidor MCP:**

- ✅ En producción 24/7
- ✅ Accesible desde Internet
- ✅ Con HTTPS y dominio propio
- ✅ Actualización automatizada
- ✅ Integrado con ChatGPT
- ✅ Costando ~€1/mes

**¡Increíble trabajo!** 🚀

---

**Última actualización**: 2 de Diciembre de 2025  
**Versión**: hevy-mcp v1.10.7  
**Servidor**: https://hevy-rober.duckdns.org

