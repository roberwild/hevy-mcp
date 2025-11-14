# 🚀 Guía de Deployment en Koyeb

## ¿Por qué Koyeb?

- ✅ **100% GRATIS** - Plan Hobby sin costo
- ✅ **Sin tarjeta de crédito** - No requiere datos de pago
- ✅ **Sin timeout** - Tu app permanece activa 24/7
- ✅ **512 MB RAM + 0.1 vCPU** - Suficiente para el MCP server
- ✅ **Deployment automático** - Desde GitHub
- ✅ **SSL/HTTPS gratis** - Certificados automáticos

## 📋 Requisitos Previos

1. Una cuenta en [Koyeb](https://app.koyeb.com/auth/signup) (gratis, sin tarjeta)
2. Tu repositorio en GitHub
3. Tu `HEVY_API_KEY`

## 🔧 Pasos de Deployment

### 1. Crear cuenta en Koyeb

Ve a https://app.koyeb.com/auth/signup y regístrate con GitHub o email.

### 2. Crear nuevo servicio

1. Click en **"Create Service"**
2. Selecciona **"GitHub"** como fuente
3. Conecta tu repositorio de GitHub si aún no lo has hecho
4. Selecciona el repositorio **hevy-mcp**

### 3. Configurar el servicio

**Builder:**
- Type: `Dockerfile`
- Dockerfile: `Dockerfile`

**Environment Variables:**
Añade estas variables:
```
NODE_ENV=production
PORT=8000
HEVY_API_KEY=tu_api_key_aqui
```

⚠️ **IMPORTANTE**: Marca `HEVY_API_KEY` como **SECRET** para mayor seguridad.

**Instance Type:**
- Selecciona **"Free"** (Hobby plan)

**Regions:**
- Selecciona **"Frankfurt (fra)"** - más cerca de España

**Health Check:**
- Type: `HTTP`
- Path: `/health`
- Port: `8000`

**Scaling:**
- Min instances: `1`
- Max instances: `1`

### 4. Deploy

Click en **"Deploy"** y espera unos minutos mientras Koyeb:
1. Clona tu repositorio
2. Construye la imagen Docker
3. Deploya tu aplicación
4. Le asigna una URL pública

### 5. Obtener tu URL

Una vez deployado, Koyeb te dará una URL como:
```
https://hevy-mcp-server-tuusuario.koyeb.app
```

## 🧪 Probar el Deployment

### Health Check
```bash
curl https://tu-app.koyeb.app/health
```

Deberías recibir:
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T22:45:00.000Z",
  "service": "hevy-mcp",
  "version": "1.10.7",
  "transport": "http"
}
```

### Consultar tu último entrenamiento
```bash
curl -X POST https://tu-app.koyeb.app/mcp/v1 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_workouts",
      "arguments": {
        "page": 1,
        "pageSize": 1
      }
    },
    "id": 1
  }'
```

## 🔄 Deployment Automático

Koyeb detecta automáticamente los cambios en tu branch principal y re-deploya la aplicación.

Para configurar deployment desde otra branch:
1. Ve a **Service Settings**
2. Sección **"Git"**
3. Cambia el **"Branch"** si es necesario

## 📊 Monitoreo

Koyeb proporciona:
- **Logs en tiempo real** - Ve qué está pasando
- **Métricas** - CPU, RAM, requests
- **Health status** - Estado de tu aplicación

Accede desde el dashboard de tu servicio.

## 🔐 Secrets Management

Para actualizar tu `HEVY_API_KEY`:
1. Ve a **Service Settings**
2. Sección **"Environment Variables"**
3. Click en el ícono de editar junto a `HEVY_API_KEY`
4. Actualiza el valor
5. Click en **"Redeploy"**

## 🆘 Troubleshooting

### La app no inicia
1. Revisa los logs en el dashboard de Koyeb
2. Verifica que `HEVY_API_KEY` esté configurada correctamente
3. Asegúrate de que el `Dockerfile` sea correcto

### Error 503
- La app puede estar reiniciándose
- Espera 1-2 minutos y vuelve a intentar

### Health check falla
- Verifica que el path sea `/health`
- Verifica que el puerto sea `8000`

## 💡 Tips

1. **Activa notificaciones** - Koyeb te avisa si algo falla
2. **Revisa los logs regularmente** - Para detectar problemas temprano
3. **Usa secrets** - Nunca hardcodees API keys en el código
4. **Monitorea el uso** - Aunque es gratis, es bueno estar al tanto

## 🔗 Enlaces Útiles

- [Documentación de Koyeb](https://www.koyeb.com/docs)
- [Koyeb Dashboard](https://app.koyeb.com/)
- [Límites del Plan Free](https://www.koyeb.com/docs/faqs/pricing)
- [FAQ de Koyeb](https://www.koyeb.com/docs/faqs)

## 🎉 ¡Listo!

Tu Hevy MCP Server ahora está corriendo 24/7 en Koyeb, sin costo y sin timeouts 💪

