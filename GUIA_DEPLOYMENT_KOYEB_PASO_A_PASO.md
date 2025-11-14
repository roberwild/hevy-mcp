# 🚀 Guía Paso a Paso: Deployar Hevy MCP en Koyeb

## ⏱️ Tiempo estimado: 5 minutos

Esta guía te llevará de la mano para deployar tu aplicación en Koyeb. Solo sigue los pasos exactamente como se indican.

---

## 📋 Antes de empezar - Lo que necesitas tener a mano:

1. ✅ Tu cuenta de GitHub (ya la tienes)
2. ✅ Tu `HEVY_API_KEY` de Hevy (cópiala y tenla lista)

---

## 🎯 PASO 1: Crear cuenta en Koyeb (2 minutos)

### 1.1 Abre tu navegador
Ve a: **https://app.koyeb.com/auth/signup**

### 1.2 Regístrate
Tienes 2 opciones:

#### Opción A: Con GitHub (RECOMENDADO - Más rápido)
1. Click en el botón **"Continue with GitHub"**
2. Si te pide autorización, click en **"Authorize Koyeb"**
3. ¡Listo! Ya tienes cuenta

#### Opción B: Con Email
1. Introduce tu email
2. Crea una contraseña
3. Click en **"Sign up"**
4. Ve a tu email y confirma la cuenta
5. Vuelve a Koyeb

### 1.3 Completa el perfil (si te lo pide)
- **Organization name**: Pon lo que quieras (ej: "hevy-mcp-personal")
- Click en **"Continue"**

---

## 🏗️ PASO 2: Crear tu primer servicio (3 minutos)

### 2.1 Pantalla de bienvenida
Verás un dashboard vacío. Click en el botón grande azul que dice:
**"Create Service"** o **"Deploy your first service"**

### 2.2 Seleccionar la fuente del código
Verás varias opciones. Click en:
**"GitHub"**

### 2.3 Conectar GitHub (solo la primera vez)
Si es tu primera vez:
1. Click en **"Connect GitHub"** o **"Install GitHub App"**
2. Se abrirá una ventana de GitHub
3. Selecciona tu cuenta
4. Elige si dar acceso a:
   - **"All repositories"** (todos) - Más fácil
   - O solo a **"hevy-mcp"** - Más seguro
5. Click en **"Install & Authorize"**
6. Vuelves automáticamente a Koyeb

### 2.4 Seleccionar el repositorio
1. En el dropdown **"Repository"**, busca y selecciona: **`hevy-mcp`**
2. En **"Branch"**, deja: **`main`** (ya está seleccionado)
3. Click en **"Next"** o continúa automáticamente

---

## ⚙️ PASO 3: Configurar el Builder (1 minuto)

### 3.1 Tipo de Builder
Koyeb detectará automáticamente que tienes un `Dockerfile`.

Si no lo detecta automáticamente:
1. En **"Builder"**, selecciona: **"Dockerfile"**
2. En **"Dockerfile path"**, pon: **`Dockerfile`**

### 3.2 Build command (opcional)
Deja este campo **VACÍO**. No necesitas poner nada.

---

## 🔐 PASO 4: Configurar Variables de Entorno (2 minutos)

Esta es la parte MÁS IMPORTANTE. Presta atención.

### 4.1 Encontrar la sección "Environment variables"
Busca en la página la sección que dice **"Environment variables"** o **"Env vars"**

### 4.2 Añadir las 3 variables

#### Variable 1: NODE_ENV
1. Click en **"Add variable"** o **"+ Add"**
2. **Key**: `NODE_ENV`
3. **Value**: `production`
4. Deja el toggle de "Secret" **APAGADO** (no es necesario)

#### Variable 2: PORT
1. Click en **"Add variable"** otra vez
2. **Key**: `PORT`
3. **Value**: `8000`
4. Deja el toggle de "Secret" **APAGADO**

#### Variable 3: HEVY_API_KEY (⚠️ IMPORTANTE)
1. Click en **"Add variable"** otra vez
2. **Key**: `HEVY_API_KEY`
3. **Value**: Pega aquí tu API key de Hevy (la que obtuviste de https://api.hevyapp.com/docs)
4. ⚠️ **ACTIVA el toggle de "Secret"** - Esto oculta el valor por seguridad
5. Debe decir "Secret" o mostrar un candado 🔒

### 4.3 Verificar
Deberías ver 3 variables:
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `8000`
- ✅ `HEVY_API_KEY` = `******` (oculta con asteriscos)

---

## 🏃 PASO 5: Configurar el Instance Type (30 segundos)

### 5.1 Encontrar la sección "Instance"
Busca la sección que dice **"Instance"** o **"Resources"**

### 5.2 Seleccionar el plan FREE
1. Deberías ver varias opciones de "Instance type"
2. Selecciona: **"Nano"** o **"Free"** (el que no cuesta nada)
3. Debería mostrar algo como:
   - `0.1 vCPU`
   - `512 MB RAM`
   - `FREE` o `$0.00/month`

---

## 🌍 PASO 6: Seleccionar la Región (30 segundos)

### 6.1 Encontrar la sección "Regions"
Busca donde dice **"Regions"** o **"Deployment regions"**

### 6.2 Seleccionar Frankfurt
1. Click en el dropdown de regiones
2. Busca y selecciona: **"Frankfurt (fra)"** o **"Europe - Frankfurt"**
3. Esta es la región más cercana a España

### 6.3 Scaling
Si te pregunta por número de instancias:
- **Min instances**: `1`
- **Max instances**: `1`

---

## 🏥 PASO 7: Configurar Health Check (1 minuto)

### 7.1 Encontrar la sección "Health checks"
Busca donde dice **"Health checks"** o **"Health check"**

### 7.2 Habilitar y configurar
1. Si hay un toggle, **ACTÍVALO** para habilitar health checks
2. **Protocol**: Selecciona **`HTTP`**
3. **Port**: Pon **`8000`**
4. **Path**: Pon **`/health`** (con la barra inicial)
5. **Grace period** (si aparece): Deja el valor por defecto (10s o 30s)
6. **Interval** (si aparece): Deja el valor por defecto (30s)

Debería quedar así:
```
Protocol: HTTP
Port: 8000
Path: /health
```

---

## 🎨 PASO 8: Configurar el nombre del servicio (opcional)

### 8.1 Encontrar "Service name"
Arriba de todo o al final, verás **"Service name"** o **"App name"**

### 8.2 Ponerle un nombre
1. Pon un nombre descriptivo: **`hevy-mcp-server`**
2. O usa el nombre generado automáticamente (lo que prefieras)

Este nombre formará parte de tu URL final.

---

## 🚀 PASO 9: DEPLOY! (El momento de la verdad)

### 9.1 Revisar el resumen
Antes de deployar, verifica que todo esté correcto:
- ✅ Repositorio: `hevy-mcp`
- ✅ Branch: `main`
- ✅ Builder: `Dockerfile`
- ✅ Variables de entorno: 3 variables (NODE_ENV, PORT, HEVY_API_KEY)
- ✅ Instance: Free/Nano
- ✅ Region: Frankfurt
- ✅ Health check: HTTP, Port 8000, Path /health

### 9.2 Click en el botón mágico
Click en el botón grande que dice:
**"Deploy"** o **"Create Service"**

### 9.3 Espera pacientemente
Verás una pantalla de progreso con varios pasos:

1. **"Building"** - Construyendo la imagen Docker (1-2 min)
   - Verás logs de construcción
   - Aparecerán líneas de npm install, npm build, etc.

2. **"Deploying"** - Deployando a la infraestructura (30 seg)
   - Creando el contenedor
   - Iniciando la aplicación

3. **"Healthy"** - ¡Listo! La app está funcionando (5-10 seg)
   - El health check pasó
   - Todo está OK ✅

**⏱️ Total: 2-3 minutos de espera**

### 9.4 Posibles mensajes durante el build
- `Installing dependencies` - Normal, está instalando paquetes
- `Building application` - Normal, está compilando el código
- `Starting health checks` - Normal, está verificando que funcione
- Si ves un **tick verde ✓** - ¡Perfecto!

---

## 🎉 PASO 10: ¡Ya está deployado! Obtén tu URL

### 10.1 Encontrar tu URL
Una vez que termine el deployment, verás:
1. Un mensaje de éxito: **"Service is running"** o **"Healthy"**
2. Tu URL pública en la parte superior

La URL tendrá este formato:
```
https://hevy-mcp-server-tuusuario.koyeb.app
```

### 10.2 Copiar la URL
1. Click en el icono de copiar 📋 junto a la URL
2. O selecciona y copia manualmente la URL completa

**⚠️ GUARDA ESTA URL** - La necesitarás para conectarte desde ChatGPT/Claude

---

## 🧪 PASO 11: Probar que funciona

### 11.1 Probar el Health Check
1. Abre una nueva pestaña en tu navegador
2. Pega tu URL y añade `/health` al final:
   ```
   https://tu-app.koyeb.app/health
   ```
3. Presiona Enter

**✅ Deberías ver algo como:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T23:00:00.000Z",
  "service": "hevy-mcp",
  "version": "1.10.7",
  "transport": "http"
}
```

Si ves esto, **¡FUNCIONA!** 🎉

### 11.2 Probar con el script automático (Recomendado)
Vuelve a tu terminal en tu proyecto y ejecuta:

```powershell
# PowerShell
$env:KOYEB_URL="https://tu-app.koyeb.app"
node test-koyeb.js
```

Este script hará 3 pruebas automáticas y te dirá si todo funciona correctamente.

**✅ Si ves "Todos los tests pasaron", estás listo! 🎉**

---

## 🔧 PASO 12: Configurar en Claude/ChatGPT

Ahora que tu servidor está corriendo, necesitas conectarlo a tu asistente de IA.

### Para Claude Desktop:

Edita tu archivo de configuración MCP:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Añade:
```json
{
  "mcpServers": {
    "hevy-mcp": {
      "url": "https://tu-app.koyeb.app/mcp/v1"
    }
  }
}
```

**⚠️ Reemplaza `tu-app.koyeb.app` con tu URL real**

Reinicia Claude Desktop.

### Para ChatGPT:

(Instrucciones similares dependiendo del cliente que uses)

---

## 📊 Monitoreo y Logs

### Ver los logs en tiempo real:
1. En el dashboard de Koyeb, click en tu servicio
2. Ve a la pestaña **"Logs"**
3. Verás todos los logs de tu aplicación en tiempo real

### Ver métricas:
1. Ve a la pestaña **"Metrics"**
2. Verás gráficos de:
   - CPU usage
   - Memory usage
   - Requests per second
   - Response time

---

## 🔄 Actualizaciones Automáticas

**¡Buena noticia!** Koyeb está configurado para auto-deploy.

Cada vez que hagas `git push` a tu repositorio:
1. Koyeb detecta el cambio automáticamente
2. Reconstruye la imagen Docker
3. Deploya la nueva versión
4. Todo sin que tengas que hacer nada 🎉

Puedes ver el progreso en el dashboard.

---

## 🆘 Troubleshooting - Si algo sale mal

### Problema 1: El build falla
**Síntomas**: Ves errores durante la fase "Building"

**Solución**:
1. Click en **"Logs"** para ver el error exacto
2. Revisa que el `Dockerfile` esté correcto
3. Asegúrate de que hiciste `git push` de todos los cambios

### Problema 2: Health check falla
**Síntomas**: Ves "Unhealthy" o el servicio no inicia

**Posibles causas**:
- `HEVY_API_KEY` incorrecta o no configurada
- Puerto incorrecto (debe ser 8000)
- Health check path incorrecto (debe ser `/health`)

**Solución**:
1. Ve a **"Settings"** → **"Environment variables"**
2. Verifica que `HEVY_API_KEY` esté correctamente configurada
3. Ve a **"Settings"** → **"Health checks"**
4. Verifica: Port `8000`, Path `/health`
5. Si cambias algo, click en **"Redeploy"**

### Problema 3: Error 503 Service Unavailable
**Síntomas**: Al acceder a tu URL ves error 503

**Solución**:
- La app puede estar iniciando, espera 1-2 minutos
- Si persiste, revisa los logs

### Problema 4: No puedo conectar desde Claude
**Síntomas**: Claude no ve las herramientas de Hevy

**Solución**:
1. Verifica que la URL en la configuración sea correcta
2. Debe incluir `/mcp/v1` al final
3. Reinicia Claude Desktop completamente
4. Verifica que el health check pase

### Problema 5: "Payment method required"
**Síntomas**: Te pide tarjeta de crédito

**Solución**:
- Algunas regiones pueden requerir tarjeta incluso para el plan free
- Prueba cambiar la región a otra europea
- Contacta soporte de Koyeb (son muy rápidos)

---

## 💡 Tips y Mejores Prácticas

### Seguridad:
1. ✅ Siempre marca `HEVY_API_KEY` como **Secret**
2. ✅ Nunca compartas tu URL pública con nadie que no confíes
3. ✅ Revisa los logs periódicamente por actividad sospechosa

### Performance:
1. El plan Free es suficiente para uso personal
2. Si necesitas más recursos, puedes upgradear fácilmente
3. La app no se duerme (sin timeout) 🎉

### Costos:
1. El plan Free es realmente gratis
2. No hay sorpresas en el billing
3. Sin cargos ocultos

### Mantenimiento:
1. Koyeb actualiza automáticamente cuando haces push
2. Revisa los logs de vez en cuando
3. Actualiza dependencias de npm regularmente

---

## 📞 ¿Necesitas Ayuda?

Si te atascas en algún paso:

1. **Revisa los logs** en Koyeb - Suelen dar pistas claras
2. **Lee esta guía otra vez** - Puede que hayas saltado un paso
3. **Contacta a Koyeb** - Su soporte es muy bueno: support@koyeb.com
4. **Documentación oficial**: https://www.koyeb.com/docs

---

## 🎊 ¡Felicidades!

Si llegaste hasta aquí y todo funciona, **¡LO LOGRASTE!** 🎉

Ahora tienes:
- ✅ Tu Hevy MCP Server corriendo 24/7
- ✅ Sin costo ($0/mes)
- ✅ Sin timeouts
- ✅ Auto-deploys desde GitHub
- ✅ HTTPS/SSL gratis
- ✅ Monitoreo incluido

**¡A entrenar se ha dicho!** 💪🔥

---

## 📝 Checklist Final

Marca todo lo que hayas completado:

- [ ] Creada cuenta en Koyeb
- [ ] Repositorio conectado desde GitHub
- [ ] Variables de entorno configuradas (3 variables)
- [ ] Instance type: Free
- [ ] Region: Frankfurt
- [ ] Health check configurado
- [ ] Deploy exitoso
- [ ] Health check pasando (URL/health funciona)
- [ ] Test con `test-koyeb.js` pasado
- [ ] Configurado en Claude/ChatGPT
- [ ] Probado desde el asistente de IA

Si marcaste todo, **¡ESTÁS LISTO!** ✅

---

**Última actualización**: Noviembre 2025
**Versión de la guía**: 1.0
**Tiempo total estimado**: 5-10 minutos (más rápido si ya tienes experiencia)

¡Disfruta tu Hevy MCP Server! 🚀

