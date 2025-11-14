# 🚀 Guía Paso a Paso: Deployar Hevy MCP en Render.com

## ⏱️ Tiempo estimado: 5 minutos

Esta guía te llevará paso a paso para deployar tu aplicación en Render.com de forma GRATUITA y sin tarjeta de crédito.

---

## ⚠️ Antes de empezar - Importante saber:

### ✅ Ventajas de Render:
- **100% Gratis** - No necesitas tarjeta de crédito
- **750 horas gratis al mes** - Más que suficiente
- **HTTPS automático** - Certificado SSL gratis
- **Auto-deploy desde GitHub** - Se actualiza solo
- **Fácil de usar** - Interface muy intuitiva

### ⚠️ Limitación del plan Free:
- **La app se duerme después de 15 minutos de inactividad**
- Cuando haces una petición después de que se duerma, tarda **30-60 segundos** en despertar
- Después funciona con normalidad
- Para uso personal es más que suficiente ✅

---

## 📋 Lo que necesitas tener a mano:

1. ✅ Tu cuenta de GitHub (ya la tienes)
2. ✅ Tu `HEVY_API_KEY` de Hevy (cópiala y tenla lista)
3. ✅ Tu repositorio con los cambios ya pusheados (ya lo hicimos)

---

## 🎯 PASO 1: Crear cuenta en Render (2 minutos)

### 1.1 Abre tu navegador
Ve a: **https://render.com/**

### 1.2 Regístrate
1. Click en **"Get Started"** o **"Sign Up"** (botón azul arriba a la derecha)
2. Verás opciones para registrarte

#### Opción RECOMENDADA: Con GitHub
1. Click en **"Sign up with GitHub"** o el botón de GitHub
2. Si te pide autorización, click en **"Authorize Render"**
3. ¡Listo! Ya tienes cuenta creada automáticamente

#### Opción alternativa: Con Email
1. Introduce tu email
2. Crea una contraseña
3. Click en **"Sign Up"**
4. Ve a tu email y confirma la cuenta
5. Vuelve a Render

### 1.3 Dashboard inicial
Verás un dashboard vacío con opciones para crear servicios.

---

## 🏗️ PASO 2: Conectar tu repositorio de GitHub (1 minuto)

### 2.1 En el dashboard de Render
Busca y click en el botón **"New +"** (arriba a la derecha)

Se desplegará un menú. Selecciona:
**"Blueprint"**

### 2.2 ¿Por qué Blueprint?
Porque ya tienes el archivo `render.yaml` configurado, que es un Blueprint. Render lo detectará automáticamente y configurará todo por ti 🎉

### 2.3 Conectar GitHub (si es la primera vez)
Si no has conectado GitHub antes:
1. Click en **"Connect GitHub"**
2. Se abre una ventana de GitHub
3. Autoriza a Render para acceder a tus repositorios
4. Puedes dar acceso a:
   - **"All repositories"** (más fácil)
   - O solo a **"hevy-mcp"** (más seguro)
5. Click en **"Install"** o **"Authorize"**

---

## 📦 PASO 3: Seleccionar el repositorio (30 segundos)

### 3.1 Buscar tu repositorio
Verás una lista de tus repositorios de GitHub.

1. Busca **"hevy-mcp"** en la lista
2. Click en **"Connect"** junto al repositorio

### 3.2 Render detecta el Blueprint
Render detectará automáticamente que tienes un archivo `render.yaml` y te mostrará:
- ✅ Un servicio web llamado "hevy-mcp-production"
- ✅ Configuración detectada automáticamente

---

## ⚙️ PASO 4: Configurar variables de entorno (2 minutos)

### 4.1 Revisar la configuración detectada
Render te mostrará un resumen del servicio que va a crear:
- **Service name**: hevy-mcp-production
- **Environment**: Docker
- **Region**: Frankfurt
- **Plan**: Free

Todo esto ya está en tu `render.yaml`, así que debería estar correcto ✅

### 4.2 ⚠️ IMPORTANTE: Configurar HEVY_API_KEY

Aquí viene la parte **MÁS IMPORTANTE**:

1. Busca la sección **"Environment Variables"** o **"Env Vars"**
2. Verás que ya hay algunas variables configuradas desde el `render.yaml`:
   - `NODE_ENV=production`
   - `PORT=10000`
3. Pero **falta una**: `HEVY_API_KEY`

### 4.3 Añadir HEVY_API_KEY

Hay dos formas de hacerlo:

#### Opción A: Antes de deployar (RECOMENDADO)
1. En la pantalla de configuración, busca **"Environment Variables"**
2. Debería haber un campo que dice que `HEVY_API_KEY` está marcada como "sync: false"
3. Click en **"Add Environment Variable"** o el botón de editar
4. **Key**: `HEVY_API_KEY` (ya debería estar)
5. **Value**: Pega tu API key de Hevy aquí
6. Click en **"Save"** o continúa

#### Opción B: Después de deployar
1. No te preocupes ahora, lo configuraremos después del deploy
2. Continúa al siguiente paso

---

## 🚀 PASO 5: ¡Deploy! (30 segundos)

### 5.1 Revisar el resumen
Antes de deployar, verifica que todo esté correcto:
- ✅ Repository: hevy-mcp
- ✅ Blueprint detected: render.yaml
- ✅ Service name: hevy-mcp-production
- ✅ Region: Frankfurt
- ✅ Plan: Free
- ✅ Environment: Docker

### 5.2 Click en el botón mágico
Click en el botón que dice:
**"Apply"** o **"Create Blueprint"**

### 5.3 Espera pacientemente (2-4 minutos)
Render empezará a construir y deployar tu aplicación. Verás:

1. **"Building"** - Construyendo la imagen Docker
   - Verás logs corriendo
   - `npm ci`, `npm run build`, etc.
   - **Tiempo: 2-3 minutos**

2. **"Deploying"** - Deployando a la infraestructura
   - Creando el servicio
   - Iniciando el contenedor
   - **Tiempo: 30 segundos**

3. **"Live"** - ¡Funcionando! ✅
   - La app está corriendo
   - Tienes una URL pública

### 5.4 Posibles mensajes durante el build
- ✅ `Installing dependencies` - Normal
- ✅ `Building application` - Normal
- ✅ `Starting service` - Normal
- ✅ **Círculo verde "Live"** - ¡Perfecto!

---

## 🔐 PASO 6: Configurar HEVY_API_KEY (si no lo hiciste antes)

Si no configuraste la `HEVY_API_KEY` antes del deploy, hazlo ahora:

### 6.1 Ir a la configuración del servicio
1. En el dashboard, click en tu servicio **"hevy-mcp-production"**
2. En el menú lateral izquierdo, click en **"Environment"**

### 6.2 Añadir la variable
1. Verás una lista de variables de entorno
2. Busca el botón **"Add Environment Variable"**
3. Click en él
4. **Key**: `HEVY_API_KEY`
5. **Value**: Pega tu API key de Hevy
6. Click en **"Save Changes"**

### 6.3 Redeploy automático
Render automáticamente re-deployará la app con la nueva variable.
Espera 1-2 minutos.

---

## 🎉 PASO 7: ¡Ya está deployado! Obtén tu URL

### 7.1 Encontrar tu URL
Una vez que el servicio está "Live":

1. En la parte superior de la página del servicio verás tu URL
2. Tendrá este formato:
   ```
   https://hevy-mcp-production.onrender.com
   ```
   o similar

### 7.2 Copiar la URL
1. Click en el icono de copiar 📋 junto a la URL
2. O selecciona y copia la URL completa

**⚠️ GUARDA ESTA URL** - La necesitarás para conectarte desde ChatGPT/Claude

---

## 🧪 PASO 8: Probar que funciona

### 8.1 Probar el Health Check en el navegador
1. Abre una nueva pestaña en tu navegador
2. Pega tu URL y añade `/health` al final:
   ```
   https://hevy-mcp-production.onrender.com/health
   ```
3. Presiona Enter

**✅ Deberías ver algo como:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T23:30:00.000Z",
  "service": "hevy-mcp",
  "version": "1.10.7",
  "transport": "http"
}
```

Si ves esto, **¡FUNCIONA!** 🎉

**⚠️ NOTA**: Si la app estaba dormida, puede tardar 30-60 segundos en responder la primera vez. Sé paciente.

### 8.2 Probar con el script automático (Recomendado)

Vuelve a tu terminal y ejecuta:

```powershell
# PowerShell
$env:RENDER_URL="https://hevy-mcp-production.onrender.com"
node test-render-local.js
```

O si prefieres, usa el script de Koyeb (funciona igual):
```powershell
$env:KOYEB_URL="https://hevy-mcp-production.onrender.com"
node test-koyeb.js
```

**✅ Si ves "Todos los tests pasaron", estás listo! 🎉**

---

## 🔧 PASO 9: Configurar en Claude/ChatGPT

Ahora que tu servidor está corriendo, conéctalo a tu asistente de IA.

### Para Claude Desktop:

Edita tu archivo de configuración MCP:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Añade o actualiza:
```json
{
  "mcpServers": {
    "hevy-mcp": {
      "url": "https://hevy-mcp-production.onrender.com/mcp/v1"
    }
  }
}
```

**⚠️ Reemplaza con tu URL real de Render**

Reinicia Claude Desktop completamente.

### Para ChatGPT con Custom GPTs o API:

Configura tu endpoint como:
```
https://hevy-mcp-production.onrender.com/mcp/v1
```

---

## 📊 Monitoreo y Logs

### Ver los logs en tiempo real:
1. En el dashboard de Render, click en tu servicio
2. Ve a la pestaña **"Logs"**
3. Verás todos los logs de tu aplicación en tiempo real
4. Útil para debugging

### Ver métricas:
1. Ve a la pestaña **"Metrics"**
2. Verás gráficos de:
   - Requests
   - Response time
   - Bandwidth
   - CPU/Memory usage

---

## 🔄 Actualizaciones Automáticas

**¡Buena noticia!** Render hace auto-deploy desde GitHub.

Cada vez que hagas `git push` a tu branch `main`:
1. Render detecta el cambio automáticamente
2. Reconstruye la imagen Docker
3. Deploya la nueva versión
4. Todo sin que tengas que hacer nada 🎉

Puedes ver el progreso en el dashboard.

### Para desactivar auto-deploy (si quieres):
1. Ve a **"Settings"** del servicio
2. Busca **"Auto-Deploy"**
3. Desactiva el toggle

---

## ⏰ Sobre el "Sleep" del plan Free

### ¿Qué significa?
- Después de **15 minutos sin recibir peticiones**, Render pone tu app a dormir
- Esto ahorra recursos y por eso el plan es gratis

### ¿Qué pasa cuando se duerme?
- La **primera petición** después de dormir tarda **30-60 segundos** en responder
- Render despierta la app automáticamente
- Las siguientes peticiones son instantáneas

### ¿Cómo evitar que se duerma?
**Opción 1**: Upgrade a plan de pago ($7/mes)
- La app nunca se duerme
- Más recursos

**Opción 2**: Ping periódico (NO RECOMENDADO para plan free)
- Puedes configurar un cron job que haga ping cada 10 minutos
- Pero esto va contra los términos de servicio de Render
- No lo hagas

### ¿Es un problema el sleep?
Para uso personal, **NO es un problema**:
- Si usas Claude/ChatGPT, la primera interacción del día tardará un minuto extra
- Después funciona con normalidad
- Es el precio a pagar por el hosting gratuito 🤷‍♂️

---

## 🆘 Troubleshooting - Si algo sale mal

### Problema 1: El build falla

**Síntomas**: Ves errores durante "Building"

**Solución**:
1. Click en **"Logs"** para ver el error exacto
2. Asegúrate de que el `Dockerfile` esté correcto
3. Verifica que todos los archivos necesarios estén en el repo
4. Asegúrate de haber hecho `git push` de todos los cambios

### Problema 2: La app no inicia

**Síntomas**: Build exitoso pero servicio no inicia

**Posibles causas**:
- `HEVY_API_KEY` no configurada
- `HEVY_API_KEY` incorrecta
- Puerto incorrecto

**Solución**:
1. Ve a **"Environment"** y verifica que `HEVY_API_KEY` esté configurada
2. Ve a **"Logs"** y busca mensajes de error
3. Verifica que el `PORT` sea `10000` (esto ya está en render.yaml)

### Problema 3: Error "Application failed to respond"

**Síntomas**: La app parece estar corriendo pero no responde

**Solución**:
1. Verifica el health check path en Render
2. Debería ser `/health`
3. Ve a **"Settings"** → **"Health Check Path"**
4. Asegúrate de que sea `/health`

### Problema 4: La app se reinicia constantemente

**Síntomas**: Ves que el servicio se reinicia una y otra vez

**Solución**:
1. Revisa los **Logs** para ver qué está causando el crash
2. Probablemente sea la `HEVY_API_KEY` incorrecta o faltante
3. Ve a **"Environment"** y verifica la key

### Problema 5: "This service has been suspended"

**Síntomas**: Mensaje de servicio suspendido

**Posibles causas**:
- Excediste las 750 horas gratis del mes (muy raro)
- Violaste términos de servicio
- Problema de facturación (aunque es free)

**Solución**:
1. Contacta soporte de Render
2. Revisa tu email por notificaciones de Render
3. Verifica el uso en el dashboard

### Problema 6: No puedo conectar desde Claude

**Síntomas**: Claude no ve las herramientas de Hevy

**Solución**:
1. Verifica que la URL en la configuración sea correcta
2. Debe incluir `/mcp/v1` al final
3. Debe ser `https://`, no `http://`
4. Reinicia Claude Desktop completamente (cierra y abre)
5. Verifica que el servicio en Render esté "Live"
6. Prueba primero el `/health` en el navegador

### Problema 7: Tarda mucho en responder

**Síntomas**: Las peticiones tardan más de 1 minuto

**Posibles causas**:
- La app estaba dormida (normal para la primera petición)
- La API de Hevy está lenta
- Problema de red

**Solución**:
1. Si es la primera petición después de inactividad, espera 1 minuto
2. Las siguientes peticiones deberían ser rápidas
3. Revisa los logs para ver si hay errores
4. Verifica el status de la API de Hevy

---

## 💡 Tips y Mejores Prácticas

### Seguridad:
1. ✅ Nunca pongas tu `HEVY_API_KEY` en el código
2. ✅ Usa variables de entorno (como lo hicimos)
3. ✅ No compartas tu URL pública en sitios públicos
4. ✅ Revisa los logs periódicamente

### Performance:
1. El plan Free tiene recursos limitados (512 MB RAM)
2. Suficiente para uso personal
3. Si necesitas más, considera upgrade a $7/mes

### Costos:
1. El plan Free es **realmente gratis**
2. 750 horas/mes es más que suficiente para uso personal
3. No hay sorpresas ni cargos ocultos
4. No necesitas tarjeta de crédito

### Mantenimiento:
1. Render auto-deploys cuando haces push a GitHub
2. Revisa los logs ocasionalmente
3. Actualiza dependencias de npm regularmente
4. El sleep después de 15 min es normal en el plan free

### Optimización:
1. La primera petición después de sleep tardará, es normal
2. Considera el upgrade si necesitas respuesta instantánea 24/7
3. El plan de $7/mes elimina el sleep

---

## 📞 ¿Necesitas Ayuda?

Si te atascas en algún paso:

1. **Revisa los logs** en Render - Dan pistas muy claras
2. **Lee esta guía otra vez** - Puede que hayas saltado algo
3. **Documentación de Render**: https://render.com/docs
4. **Soporte de Render**: support@render.com (muy buenos)
5. **Comunidad de Render**: https://community.render.com

---

## 🎊 ¡Felicidades!

Si llegaste hasta aquí y todo funciona, **¡LO LOGRASTE!** 🎉

Ahora tienes:
- ✅ Tu Hevy MCP Server corriendo en la nube
- ✅ Sin costo ($0/mes)
- ✅ Sin tarjeta de crédito necesaria
- ✅ Auto-deploys desde GitHub
- ✅ HTTPS/SSL gratis
- ✅ Monitoreo incluido
- ⚠️ Se duerme después de 15 min (pero se despierta solo)

**¡A entrenar se ha dicho!** 💪🔥

---

## 📝 Checklist Final

Marca todo lo que hayas completado:

- [ ] Creada cuenta en Render
- [ ] Repositorio conectado desde GitHub
- [ ] Blueprint detectado automáticamente
- [ ] Variable `HEVY_API_KEY` configurada
- [ ] Deploy exitoso
- [ ] Servicio en estado "Live"
- [ ] Health check funciona (URL/health responde)
- [ ] Configurado en Claude/ChatGPT
- [ ] Probado desde el asistente de IA
- [ ] Funciona correctamente

Si marcaste todo, **¡ESTÁS LISTO!** ✅

---

## 🔄 Comparativa: Render vs otras opciones

| Feature | Render | Koyeb | Railway | Fly.io |
|---------|--------|-------|---------|--------|
| Costo | **Gratis** | Pago | $5/mes | $5/mes créditos |
| Tarjeta | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí |
| Timeout | ⚠️ 15 min | ❌ No | ❌ No | ❌ No |
| Setup | ✅ Fácil | ✅ Fácil | ✅ Fácil | ⚠️ Medio |
| Auto-deploy | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| Región EU | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |

**Para tu caso (gratis + sin tarjeta), Render es la MEJOR opción** ✅

---

**Última actualización**: Noviembre 2025  
**Versión de la guía**: 1.0  
**Tiempo total estimado**: 5-10 minutos  
**Dificultad**: Fácil 😊

¡Disfruta tu Hevy MCP Server en Render! 🚀

