# 🏋️ Hevy MCP Server - Raspberry Pi Deployment

[![Node.js](https://img.shields.io/badge/Node.js-v24.11.1-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PM2](https://img.shields.io/badge/PM2-v6.0.14-purple)](https://pm2.keymetrics.io/)
[![HTTPS](https://img.shields.io/badge/HTTPS-Let's%20Encrypt-brightgreen)](https://letsencrypt.org/)
[![Status](https://img.shields.io/badge/Status-Online%20✅-success)](https://hevy-rober.duckdns.org/health)

> Servidor MCP (Model Context Protocol) para integrar la API de Hevy con ChatGPT, desplegado en Raspberry Pi con HTTPS.

---

## 🌐 Acceso al Servidor

- **Producción**: https://hevy-rober.duckdns.org
- **Health Check**: https://hevy-rober.duckdns.org/health
- **Endpoint MCP**: https://hevy-rober.duckdns.org/mcp

---

## 📚 Documentación

### 📖 Guías Completas

| Guía | Descripción | Link |
|------|-------------|------|
| 🚀 **Deployment Guide** | Guía completa de deployment, arquitectura, y troubleshooting | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| ⚡ **Quick Deploy** | Comandos rápidos para actualizar el servidor | [QUICK_DEPLOY.md](QUICK_DEPLOY.md) |
| 🔐 **SSH Setup** | Configurar SSH con GitHub (método PRO) | [SSH_SETUP_GUIDE.md](SSH_SETUP_GUIDE.md) |
| 📝 **README Original** | Documentación técnica del proyecto | [README.md](README.md) |
| 📋 **Changelog** | Historial de cambios | [CHANGELOG.md](CHANGELOG.md) |

---

## ⚡ Quick Start

### Actualizar el servidor

```bash
# 1. Conectar por SSH
ssh rober@192.168.1.141

# 2. Ejecutar script de actualización
~/hevy-mcp/update.sh

# 3. Listo! ✅
```

**Tiempo total: ~30 segundos**

---

## 🛠️ Stack Tecnológico

### Infraestructura

```
Internet (HTTPS)
    ↓
DuckDNS (DNS Dinámico)
    ↓
Router DIGI (Port Forwarding 80/443)
    ↓
Nginx (Reverse Proxy + SSL)
    ↓
PM2 (Process Manager)
    ↓
Node.js v24.11.1
    ↓
Hevy MCP Server (TypeScript)
    ↓
Hevy API
```

### Tecnologías

- **Hardware**: Raspberry Pi
- **OS**: Raspberry Pi OS Lite (64-bit)
- **Runtime**: Node.js v24.11.1 (vía NVM)
- **Language**: TypeScript
- **Process Manager**: PM2 v6.0.14
- **Web Server**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **DNS**: DuckDNS (actualización cada 5 min)
- **Protocol**: MCP (Model Context Protocol)

---

## 🚀 Funcionalidades

### ✨ Métodos Disponibles

#### 📊 Entrenamientos (Workouts)

- ✅ `getLastWorkout` - Obtener último entrenamiento
- ✅ `getLastWorkouts` - Obtener últimos N entrenamientos
- ✅ `getWorkouts` - Listar entrenamientos con paginación
- ⭐ `searchWorkouts` - **NUEVO** - Buscar entrenamientos por texto

#### 🏃 Rutinas (Routines)

- ✅ `getRoutines` - Listar rutinas
- ✅ `createRoutine` - Crear nueva rutina
- ✅ `updateRoutine` - Actualizar rutina existente
- ✅ `getRoutineDetails` - Obtener detalles de una rutina
- ✅ `addExerciseToRoutine` - Añadir ejercicio a rutina

#### 💪 Ejercicios (Exercise Templates)

- ✅ `getExerciseTemplates` - Listar plantillas de ejercicios
- ✅ `getExerciseTemplate` - Obtener detalles de un ejercicio
- ✅ `searchExerciseTemplates` - Buscar ejercicios (fuzzy matching en español)

#### 📁 Carpetas (Folders)

- ✅ `getRoutineFolders` - Listar carpetas de rutinas

---

## 🎯 Ejemplo de Uso

### Con ChatGPT

```
Usuario: "¿Cuántos entrenamientos he hecho en VivaGym de Ferrol?"

ChatGPT: "Has realizado 7 entrenamientos en el VivaGym de Ferrol 🏋️

Lista completa:
1. Primer VivaGym 🏋️ en Ferrol
2. Segundo VivaGym 🏋️ en Ferrol
3. Tercer VivaGym 🏋️ en Ferrol
..."
```

### Con cURL

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

**Respuesta:**

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

## 📦 Instalación Local (Desarrollo)

### Requisitos

- Node.js >= 18.0.0
- npm o pnpm
- Git

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/TU_USUARIO/hevy-mcp.git
cd hevy-mcp

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
nano .env  # Añadir tu HEVY_API_KEY

# 4. Compilar
npm run build

# 5. Ejecutar en desarrollo
npm run dev

# O ejecutar en producción
npm start
```

---

## 🔧 Comandos Útiles

### PM2 (en Raspberry Pi)

```bash
pm2 status                    # Ver estado del servidor
pm2 logs hevy-mcp             # Ver logs en tiempo real
pm2 restart hevy-mcp          # Reiniciar servidor
pm2 monit                     # Monitor de recursos
```

### Git

```bash
git status                    # Ver estado
git pull origin main          # Actualizar código
git log --oneline -5          # Ver últimos commits
```

### Sistema

```bash
vcgencmd measure_temp         # Temperatura de la Raspberry Pi
htop                          # Monitor del sistema
df -h                         # Espacio en disco
```

---

## 🔐 Seguridad

### Implementado

- ✅ **HTTPS** con certificados SSL de Let's Encrypt
- ✅ **API Key** requerida para acceder a Hevy API
- ✅ **Nginx** como reverse proxy (no expone Node.js directamente)
- ✅ **Firewall** del router (solo puertos 80 y 443 abiertos)
- ✅ **PM2** ejecuta sin privilegios de root
- ✅ **SSH** para acceso remoto seguro

### Recomendaciones

- 🔒 Cambiar puerto SSH por defecto (22 → 2222)
- 🔒 Instalar Fail2ban para prevenir ataques de fuerza bruta
- 🔒 Rate limiting en Nginx
- 🔒 Actualizar sistema regularmente

Ver más en [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#-seguridad)

---

## 💰 Costos

### Electricidad

- **Consumo**: ~5-8W
- **Costo mensual**: ~€0.87
- **Costo anual**: ~€10.44

### Servicios

- ✅ DuckDNS: **Gratis**
- ✅ Let's Encrypt: **Gratis**
- ✅ GitHub: **Gratis**
- ✅ Software (Nginx, PM2, Node.js): **Gratis**

**Total**: **€10.44/año** 🎉

### Comparación con Cloud

| Servicio | Costo Anual |
|----------|-------------|
| **Raspberry Pi** | **€10.44** ✅ |
| Heroku Hobby | €84 |
| DigitalOcean | €72 |
| AWS EC2 | €102 |
| Railway | ~€57 |

**Ahorro: ~€60-90/año** 💰

---

## 🧪 Testing

### Test Local

```bash
# Health check
curl http://localhost:3000/health

# Test método help
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"help","id":1}'
```

### Test Remoto

```bash
# Desde cualquier lugar
curl https://hevy-rober.duckdns.org/health
```

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| Servidor no responde | `pm2 restart hevy-mcp` |
| Error 502 | Verificar que PM2 esté corriendo |
| Puerto 3000 ocupado | `pm2 delete all` |
| Git pide contraseña | Configurar SSH keys ([guía](SSH_SETUP_GUIDE.md)) |

Ver guía completa: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#-troubleshooting)

---

## 📊 Estado del Proyecto

### ✅ Completado

- [x] Servidor en producción 24/7
- [x] HTTPS con certificado SSL válido
- [x] Dominio personalizado (DuckDNS)
- [x] Actualización automática con script
- [x] Integración completa con ChatGPT
- [x] Método searchWorkouts implementado
- [x] Alta disponibilidad con PM2
- [x] Documentación completa

### 🔜 Mejoras Futuras

- [ ] Configurar SSH keys para git (opcional)
- [ ] Rate limiting en Nginx
- [ ] Monitoreo y alertas
- [ ] Backups automáticos
- [ ] Analytics de uso

---

## 🤝 Contribuir

### Flujo de trabajo

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz tus cambios
4. Commit: `git commit -m "Añadir nueva funcionalidad"`
5. Push: `git push origin feature/nueva-funcionalidad`
6. Crea un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**Rober**

- GitHub: [@TU_USUARIO](https://github.com/TU_USUARIO)
- Servidor: https://hevy-rober.duckdns.org

---

## 🙏 Agradecimientos

- **Hevy**: Por la increíble API de entrenamientos
- **DuckDNS**: Por el servicio gratuito de DNS dinámico
- **Let's Encrypt**: Por los certificados SSL gratuitos
- **OpenAI**: Por ChatGPT y el MCP protocol

---

## 📞 Soporte

¿Tienes problemas o preguntas?

1. Revisa la [Guía de Deployment](DEPLOYMENT_GUIDE.md)
2. Revisa [Troubleshooting](DEPLOYMENT_GUIDE.md#-troubleshooting)
3. Revisa los logs: `pm2 logs hevy-mcp`

---

## 🌟 Versión

**v1.10.7** - Última actualización: 2 de Diciembre de 2025

### Últimos cambios

- ✨ Añadido método `searchWorkouts`
- 📝 Documentación completa de deployment
- 🚀 Script de actualización automática
- 🔐 Guía de configuración SSH con GitHub

Ver [CHANGELOG.md](CHANGELOG.md) para historial completo.

---

<div align="center">

**Hecho con ❤️ en Raspberry Pi**

[![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-C51A4A?style=for-the-badge&logo=Raspberry-Pi)](https://www.raspberrypi.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

