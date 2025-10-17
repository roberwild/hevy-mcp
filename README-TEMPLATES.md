# 🏋️ Catálogo de Ejercicios - Hevy MCP

## 📋 Descripción

El servidor MCP de Hevy utiliza un **catálogo local** de ejercicios almacenado en `templates-hevy-exercises.json` para proporcionar búsquedas **instantáneas** sin llamadas a la API de Hevy.

## ✨ Características

- 🚀 **Búsqueda instantánea** - Sin timeouts, sin límites de rate
- 🇪🇸 **Soporte bilingüe** - Busca en español o inglés usando CSV de traducciones
- 🔍 **Fuzzy matching** - Encuentra ejercicios incluso con errores tipográficos
- 💾 **Base de datos local** - ~430 ejercicios disponibles offline
- 🎯 **Sin paginación** - Devuelve todos los resultados relevantes
- 📚 **MCP Resource** - Catálogo completo disponible bajo demanda para LLMs

## 🔧 Métodos Disponibles

### `searchExerciseTemplates`

Busca ejercicios por nombre en español o inglés usando datos locales.

**Parámetros:**
- `query` (string): Término de búsqueda en español o inglés
- `limit` (number, opcional): Máximo de resultados (default: 10, max: 50)

**Ejemplo:**
```javascript
{
  "method": "searchExerciseTemplates",
  "params": {
    "query": "press banca",
    "limit": 5
  }
}
```

**Respuesta:**
```json
{
  "query": "press banca",
  "translatedQuery": "bench press",
  "results": [
    {
      "id": "79D0BB3A",
      "title": "Bench Press (Barbell)",
      "spanishTitle": "Press de banca (barra)",
      "type": "weight_reps",
      "primaryMuscleGroup": "chest",
      "equipment": "barbell",
      "relevance": "100%"
    }
  ],
  "totalResults": 5,
  "catalogInfo": {
    "totalExercises": 432,
    "lastUpdated": "2025-10-15T20:30:00.000Z",
    "spanishTranslationsAvailable": 432
  }
}
```

### `getExerciseTemplatesInfo`

Obtiene información sobre el catálogo local de ejercicios.

**Ejemplo:**
```javascript
{
  "method": "getExerciseTemplatesInfo",
  "params": {}
}
```

**Respuesta:**
```json
{
  "totalExercises": 432,
  "lastUpdated": "2025-10-15T20:30:00.000Z",
  "catalogVersion": "Local JSON file",
  "updateInstructions": "Run 'npm run update-templates' to fetch latest exercises from Hevy API",
  "source": "templates-hevy-exercises.json"
}
```

## 📚 MCP Resource: Catálogo Completo

### ¿Qué es un MCP Resource?

Un MCP Resource es un patrón estándar para exponer datos estáticos que los LLMs pueden leer **bajo demanda**. A diferencia de tools que ejecutan acciones, los resources son datos de referencia.

### `hevy://exercises/catalog`

**URI:** `hevy://exercises/catalog`  
**Tipo:** `text/csv`  
**Descripción:** Catálogo completo de 432 ejercicios con traducciones al español

**Cuándo usarlo:**
- ✅ Cuando necesites ver TODOS los ejercicios disponibles
- ✅ Cuando quieras filtrar ejercicios por múltiples criterios
- ✅ Cuando necesites el catálogo completo en la conversación

**Cuándo NO usarlo:**
- ❌ Para búsquedas específicas (usa `search-exercise-templates`)
- ❌ En cada conversación (consume ~4,000-5,000 tokens)

**Ejemplo de uso (Claude Desktop):**
```
Usuario: "Muéstrame todos los ejercicios de bíceps disponibles"

Claude:
1. Lee resource: hevy://exercises/catalog
2. Filtra ejercicios que contengan "bicep" en el nombre
3. Muestra lista completa al usuario
```

**Formato del CSV:**
```csv
id,title,title_spanish
3BC06AD3,21s Bicep Curl,Curl de bíceps 21s
A5AC6449,Bicep Curl (Barbell),Curl de bíceps (barra)
ADA8623C,Bicep Curl (Cable),Curl de bíceps (cable)
37FCC2BB,Bicep Curl (Dumbbell),Curl de bíceps (mancuernas)
...
```

### Comparación: Tool vs Resource

| Aspecto | `search-exercise-templates` (Tool) | `hevy://exercises/catalog` (Resource) |
|---------|-----------------------------------|--------------------------------------|
| **Uso** | Búsquedas específicas | Ver catálogo completo |
| **Tokens** | ~100 por búsqueda | ~4,000-5,000 |
| **Cuándo** | 99% de los casos | 1% de los casos |
| **Ejemplo** | "busca press banca" | "muéstrame todos los ejercicios" |

## 📚 Traducciones Soportadas

### Grupos Musculares

| Español | Inglés |
|---------|--------|
| Pecho | Chest |
| Espalda | Back |
| Piernas | Legs |
| Hombros | Shoulders |
| Brazos | Arms |
| Abdominales | Abdominals |
| Core | Core |

### Ejercicios Comunes

| Español | Inglés |
|---------|--------|
| Press banca | Bench press |
| Sentadilla | Squat |
| Peso muerto | Deadlift |
| Dominadas | Pull up |
| Remo | Row |
| Press militar | Military press |
| Curl bíceps | Bicep curl |
| Extensiones tríceps | Tricep extension |
| Prensa de piernas | Leg press |
| Plancha | Plank |

## 🔄 Actualizar el Catálogo

### ¿Cuándo actualizar?

Actualiza el catálogo cuando:
- Hevy añade nuevos ejercicios a su plataforma
- No encuentras un ejercicio específico
- Han pasado varios meses desde la última actualización
- El campo `lastUpdated` muestra una fecha antigua

### Cómo actualizar

#### Opción 1: Manual

```bash
# Configura tu API key de Hevy
export HEVY_API_KEY=tu_api_key_aqui

# Ejecuta el script de actualización
npm run update-templates
```

#### Opción 2: Desde el archivo .env

```bash
# Agrega tu API key al archivo .env
echo "HEVY_API_KEY=tu_api_key_aqui" >> .env

# Ejecuta el script
npm run update-templates
```

### Proceso de Actualización

El script `update-exercise-templates.js`:

1. ✅ Lee la API key desde `process.env.HEVY_API_KEY`
2. ✅ Hace peticiones paginadas a `/v1/exercise-templates` (100 por página)
3. ✅ Espera 500ms entre requests para no saturar la API
4. ✅ Combina todos los resultados en un solo archivo
5. ✅ Guarda backup del archivo anterior (`.bak`)
6. ✅ Actualiza `templates-hevy-exercises.json` con metadata

**Tiempo estimado:** 2-3 segundos para ~430 ejercicios

### Salida del Script

```
🏋️  Actualizador de Plantillas de Ejercicios Hevy

📦 Archivo actual: 432 ejercicios
📅 Última actualización: 2025-10-15T20:30:00.000Z

🔄 Obteniendo ejercicios de Hevy API...
📏 Tamaño de página: 100 ejercicios

📄 Página 1...
   ✅ 100 ejercicios obtenidos (450ms)
   📊 Total acumulado: 100
   ⏳ Esperando 500ms...

[...]

============================================================
📊 RESUMEN:
   • Total de ejercicios: 432
   • Páginas procesadas: 5
   • Tiempo total: 2.85s
   • Promedio: 86.4 ejercicios/página
   • ℹ️  Sin cambios en cantidad
============================================================

💾 Backup guardado: templates-hevy-exercises.json.bak
✅ Archivo actualizado: templates-hevy-exercises.json
📅 Fecha: 2025-10-15T20:35:00.000Z
📦 Tamaño del archivo: 156.32 KB
```

## 🤖 Automatización (Opcional)

### GitHub Actions

Puedes configurar una acción de GitHub para actualizar automáticamente el catálogo:

```yaml
# .github/workflows/update-templates.yml
name: Update Exercise Templates

on:
  schedule:
    - cron: '0 0 * * 0'  # Cada domingo a medianoche
  workflow_dispatch:      # Trigger manual

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Update templates
        env:
          HEVY_API_KEY: ${{ secrets.HEVY_API_KEY }}
        run: npm run update-templates
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add templates-hevy-exercises.json
          git diff --staged --quiet || git commit -m "chore: update exercise templates [automated]"
          git push
```

**Configuración:**
1. Ve a Settings > Secrets > Actions en tu repositorio
2. Crea un secret llamado `HEVY_API_KEY` con tu API key
3. La acción se ejecutará automáticamente cada domingo

## 📊 Estructura del Archivo

```json
{
  "page": 1,
  "page_count": 5,
  "exercise_templates": [
    {
      "id": "3BC06AD3",
      "title": "21s Bicep Curl",
      "type": "weight_reps",
      "primary_muscle_group": "biceps",
      "secondary_muscle_groups": [],
      "equipment": "barbell",
      "is_custom": false
    }
  ],
  "metadata": {
    "total_exercises": 432,
    "last_updated": "2025-10-15T20:30:00.000Z",
    "generated_by": "scripts/update-exercise-templates.js",
    "source": "Hevy API v1",
    "max_page_size": 100,
    "total_pages_fetched": 5,
    "generation_time_seconds": 2.85
  }
}
```

## 🎯 Flujo de Uso con GPT

### Ejemplo: Añadir ejercicio a una rutina

```
Usuario: "Añade press de banca a mi rutina"

GPT (paso 1): Buscar el ejercicio
  → searchExerciseTemplates({ query: "press banca" })
  ← { results: [{ id: "79D0BB3A", title: "Barbell Bench Press" }] }

GPT (paso 2): Añadir a la rutina
  → addExerciseToRoutine({
      routineId: "xxx",
      exerciseTemplateId: "79D0BB3A",
      sets: [{ type: "normal", reps: 10, weightKg: 40 }]
    })
  ← Ejercicio añadido exitosamente
```

### Ventajas

- ✅ **Sin errores de timeout** - Búsqueda local instantánea
- ✅ **Sin límites de API** - No consume rate limits de Hevy
- ✅ **Lenguaje natural** - Funciona con términos en español
- ✅ **Tolerante a errores** - Fuzzy matching encuentra ejercicios similares

## ⚠️ Troubleshooting

### El script falla con "HEVY_API_KEY no está configurada"

**Solución:**
```bash
export HEVY_API_KEY=tu_api_key
npm run update-templates
```

### El script tarda mucho o se cuelga

**Posibles causas:**
- Timeout en la API de Hevy (10s por request)
- Conexión de red inestable

**Solución:**
- El script automáticamente guarda lo que ha obtenido hasta el momento
- Reintenta ejecutar `npm run update-templates`

### No encuentro un ejercicio específico

**Opciones:**
1. Intenta con términos más generales ("press" en lugar de "press inclinado")
2. Busca en inglés si no funciona en español
3. Actualiza el catálogo: `npm run update-templates`
4. Verifica que el ejercicio existe en Hevy

### El archivo JSON se corrompió

**Solución:**
```bash
# Restaurar desde backup
cp templates-hevy-exercises.json.bak templates-hevy-exercises.json

# O regenerar desde cero
npm run update-templates
```

## 📝 Notas

- El catálogo local es un **snapshot** de la API de Hevy en un momento dado
- Los ejercicios personalizados del usuario **NO** están incluidos (solo los por defecto de Hevy)
- El archivo pesa ~150-200 KB (perfectamente manejable)
- La búsqueda local es **mucho más rápida** que paginar 430 ejercicios a través de la API

## 🔗 Enlaces

- [Hevy API Documentation](https://api.hevyapp.com/docs)
- [Script de actualización](./scripts/update-exercise-templates.js)
- [Implementación TypeScript](./src/tools/templates.ts)

---

**Última actualización:** 15 de Octubre, 2025  
**Mantenedor:** Rober (@RoberHevyTrainer)

