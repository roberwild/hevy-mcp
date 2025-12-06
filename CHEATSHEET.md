# 📝 Hevy MCP - Cheat Sheet

> Referencia rápida de comandos y URLs más utilizados

---

## 🌐 URLs

```
Producción:  https://hevy-rober.duckdns.org
Health:      https://hevy-rober.duckdns.org/health
MCP:         https://hevy-rober.duckdns.org/mcp
IP Local:    192.168.1.141
SSH:         ssh rober@192.168.1.141
```

---

## 🚀 Actualizar Servidor

### AUTO-DEPLOY ⭐ (Recomendado)
```bash
git push origin main
# ¡Ya está! GitHub Actions deploya automáticamente
# Ver: github.com/TU_USUARIO/hevy-mcp/actions
```

### Método Rápido
```bash
ssh rober@192.168.1.141
~/hevy-mcp/update.sh
exit
```

### Un Solo Comando (desde PC)
```bash
ssh rober@192.168.1.141 "cd ~/hevy-mcp && ./update.sh"
```

---

## 🔧 PM2

```bash
pm2 status                    # Estado
pm2 logs hevy-mcp             # Logs en tiempo real
pm2 logs hevy-mcp --lines 50  # Últimos 50 logs
pm2 restart hevy-mcp          # Reiniciar
pm2 stop hevy-mcp             # Detener
pm2 monit                     # Monitor recursos
pm2 save                      # Guardar config
pm2 delete hevy-mcp           # Eliminar proceso
```

---

## 🐙 Git

```bash
cd ~/hevy-mcp
git status                    # Estado
git pull origin main          # Actualizar
git log --oneline -5          # Últimos commits
git remote -v                 # Ver remote
git stash                     # Guardar cambios
git stash pop                 # Restaurar cambios
```

---

## 🌐 Nginx

```bash
sudo systemctl status nginx   # Estado
sudo systemctl restart nginx  # Reiniciar
sudo systemctl reload nginx   # Recargar config
sudo nginx -t                 # Test config

# Logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Config
sudo nano /etc/nginx/sites-available/hevy-mcp
```

---

## 🔐 SSL/Certbot

```bash
sudo certbot certificates     # Ver certificados
sudo certbot renew            # Renovar
sudo certbot renew --dry-run  # Test renovación
```

---

## 🖥️ Sistema

```bash
vcgencmd measure_temp         # Temperatura
htop                          # Monitor
df -h                         # Disco
free -h                       # RAM
uptime                        # Uptime
sudo reboot                   # Reiniciar
```

---

## 🧪 Tests

### Local (en Raspberry Pi)
```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"help","id":1}'
```

### Remoto (desde PC)
```bash
curl https://hevy-rober.duckdns.org/health
```

---

## 📊 Métodos MCP

### Workouts
```
getLastWorkout
getLastWorkouts         {"count": 3}
getWorkouts             {"page": 1, "pageSize": 5}
searchWorkouts          {"query": "VivaGym"}  ⭐ NUEVO
```

### Routines
```
getRoutines
createRoutine
updateRoutine
getRoutineDetails       {"routine_id": "xxx"}
addExerciseToRoutine
```

### Exercises
```
getExerciseTemplates
getExerciseTemplate     {"template_id": "xxx"}
searchExerciseTemplates {"query": "press"}
```

### Folders
```
getRoutineFolders
```

---

## 🔥 Comandos de Emergencia

```bash
# Servidor no responde
pm2 restart hevy-mcp

# PM2 crasheado
pm2 kill
pm2 resurrect

# Puerto 3000 ocupado
sudo netstat -tlnp | grep :3000
pm2 delete all

# Nginx no funciona
sudo systemctl restart nginx

# Reiniciar todo
sudo reboot
```

---

## 📁 Archivos Importantes

```
~/hevy-mcp/                           # Proyecto
~/hevy-mcp/.env                       # Variables de entorno
~/hevy-mcp/ecosystem.config.cjs       # Config PM2
~/hevy-mcp/update.sh                  # Script actualización
~/duckdns/duck.sh                     # DuckDNS update
/etc/nginx/sites-available/hevy-mcp   # Config Nginx
~/.pm2/logs/hevy-mcp-out-*.log        # Logs PM2
~/.pm2/logs/hevy-mcp-error-*.log      # Errors PM2
```

---

## 🔍 Troubleshooting Rápido

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| 502 Bad Gateway | PM2 caído | `pm2 restart hevy-mcp` |
| No responde | Puerto ocupado | `pm2 delete all` |
| Git pide password | Usando HTTPS | Ver SSH_SETUP_GUIDE.md |
| SSL expirado | Certbot no renovó | `sudo certbot renew` |
| Alta temp (>80°C) | Sobrecarga | Revisar `pm2 monit` |

---

## 💡 Alias Útiles

Añadir a `~/.bashrc`:

```bash
alias pm2l='pm2 logs hevy-mcp'
alias pm2s='pm2 status'
alias pm2r='pm2 restart hevy-mcp'
alias hevy='cd ~/hevy-mcp'
alias update-hevy='cd ~/hevy-mcp && ./update.sh'
```

Aplicar: `source ~/.bashrc`

---

## 🎯 Flujo de Deploy

```
1. En PC (desarrollo):
   git add .
   git commit -m "mensaje"
   git push origin main

2. En Raspberry Pi:
   ssh rober@192.168.1.141
   ~/hevy-mcp/update.sh
   exit

3. Verificar:
   curl https://hevy-rober.duckdns.org/health
```

---

## 📞 Info Rápida

```
Proyecto:    hevy-mcp
Usuario:     rober
Host:        RASPBERRY-ROBER
IP Local:    192.168.1.141
IP Pública:  79.112.13.108
Dominio:     hevy-rober.duckdns.org
Puerto App:  3000
Node:        v24.11.1
PM2:         v6.0.14
```

---

## 🔗 Links Rápidos

- **Health**: https://hevy-rober.duckdns.org/health
- **GitHub Settings SSH**: https://github.com/settings/keys
- **DuckDNS Panel**: https://www.duckdns.org
- **Docs Completa**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

**Imprime esto y tenlo siempre a mano! 🖨️**

