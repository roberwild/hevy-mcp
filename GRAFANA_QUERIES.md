# 📊 Grafana Queries para Hevy MCP

## 🎯 Query principal - Logs de la aplicación Hevy MCP

```logql
{container_name=~".*j4w808.*"}
```

**Descripción:** Muestra todos los logs de la aplicación Node.js de Hevy MCP, incluyendo:
- 🌐 Llamadas a Hevy API
- 📊 Status de respuestas
- ✅ Operaciones exitosas
- ❌ Errores
- 🤖 Requests de GPT

---

## 🔍 Queries útiles adicionales

### Ver solo errores de Hevy MCP
```logql
{container_name=~".*j4w808.*"} |~ "(?i)(error|exception|fail|❌)"
```

### Ver solo llamadas a Hevy API
```logql
{container_name=~".*j4w808.*"} |= "🌐 Llamando a Hevy API"
```

### Ver solo requests de GPT
```logql
{container_name=~".*j4w808.*"} |= "🤖 GPT Request"
```

### Ver respuestas exitosas de la API
```logql
{container_name=~".*j4w808.*"} |= "✅ Respuesta de Hevy API"
```

### Ver errores de la API (400, 500, etc.)
```logql
{container_name=~".*j4w808.*"} |~ "📊 Hevy API Status: [45][0-9]{2}"
```

### Ver logs con formato JSON parseado
```logql
{container_name=~".*j4w808.*"} | json | line_format "{{.log}}"
```

---

## 📊 Queries para otros servicios

### Logs de Coolify
```logql
{container_name="coolify"}
```

### Logs de Grafana
```logql
{container_name="grafana"}
```

### Logs del Buscador de ETFs
```logql
{container_name=~".*ao80ck4cc.*"}
```

### Todos los contenedores Docker
```logql
{job="docker"}
```

---

## 🔗 Acceso rápido a Grafana

**Explore (para queries ad-hoc):**
```
https://grafana.roberace.com/explore
```

**Dashboard (una vez creado):**
```
https://grafana.roberace.com/dashboards
```

---

## 🔍 Comandos útiles para obtener información

### Listar todos los nombres de contenedores en Loki

```bash
curl -s "http://localhost:3100/loki/api/v1/label/container_name/values" | jq
```

**Ejecutar desde la Raspberry Pi** para ver qué contenedores están siendo monitoreados por Loki.

**Salida esperada:**
```json
{
  "status": "success",
  "data": [
    "ao80ck4cc8c48cgo0o08g4w0-205751574811",
    "cadvisor",
    "coolify",
    "coolify-db",
    "coolify-proxy",
    "coolify-realtime",
    "coolify-redis",
    "coolify-sentinel",
    "grafana",
    "homer",
    "j4w808go4osc0gccok0o0oo0-225909165511",
    "loki",
    "node-exporter",
    "pgadmin",
    "portainer",
    "prometheus",
    "promtail",
    "uptime-kuma"
  ]
}
```

### Listar todos los contenedores Docker en ejecución

```bash
docker ps --format "{{.ID}} - {{.Names}}"
```

**Útil para identificar qué contenedor corresponde a cada aplicación.**

### Obtener el ID del contenedor de Hevy MCP

```bash
docker ps --format "{{.Names}}" | grep "j4w808"
```

### Ver logs directamente desde Docker (sin Grafana)

```bash
# Ver últimos 50 logs
docker logs j4w808go4osc0gccok0o0oo0-225909165511 --tail 50

# Ver logs en tiempo real
docker logs j4w808go4osc0gccok0o0oo0-225909165511 --follow

# Ver logs y filtrar por "error"
docker logs j4w808go4osc0gccok0o0oo0-225909165511 --tail 100 | grep -i error
```

### Verificar que Loki está funcionando

```bash
curl -s http://localhost:3100/ready
```

**Respuesta esperada:** `ready`

### Ver todos los labels disponibles en Loki

```bash
curl -s "http://localhost:3100/loki/api/v1/labels" | jq
```

**Salida esperada:**
```json
{
  "status": "success",
  "data": [
    "container_id",
    "container_name",
    "filename",
    "image",
    "job",
    "service_name",
    "stream"
  ]
}
```

---

## 💡 Tips

1. **Rango de tiempo:** Usa "Last 24 hours" para ver más logs históricos
2. **Live streaming:** Activa el botón "Live" arriba a la derecha para ver logs en tiempo real
3. **Filtros:** Usa los filtros de campos en el panel izquierdo para búsquedas específicas
4. **Highlight:** Habilita "Enable logs highlighting" en las opciones del panel

---

## 🐛 Bug detectado

La aplicación está pidiendo `pageSize=500` a la API de Hevy, pero el máximo es 100.

**Ubicación del error:** `src/simple-server.ts` en el método `getExerciseTemplates`

**Solución:** Limitar el `pageSize` a 100 máximo.

