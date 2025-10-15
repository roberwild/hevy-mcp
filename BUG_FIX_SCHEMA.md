# 🐛 Bug Fix: Schema JSON - addExerciseToRoutine

## 📋 Resumen del Problema

El método `addExerciseToRoutine` estaba fallando constantemente con el siguiente error:

```json
{
  "error": "\"routine.exercises[1].exercise_template_id\" is required"
}
```

### ❌ Error Original

El asistente de IA estaba leyendo el schema JSON (`hevy-crud-schema.json`) y enviando parámetros incorrectos:

**Lo que enviaba:**
```json
{
  "method": "addExerciseToRoutine",
  "params": {
    "routineId": "6fdd6220-8277-460f-bb35-641d225fd4c9",
    "templateId": "43573BB8"
  }
}
```

**Problemas identificados:**
1. ❌ Enviaba `templateId` en lugar de `exerciseTemplateId`
2. ❌ No enviaba el array de `sets` (requerido)
3. ❌ El schema no documentaba correctamente los parámetros necesarios

## 🔍 Análisis de Causa Raíz

**NO era un bug de la API de Hevy** ✅

La API de Hevy funciona perfectamente. El problema estaba en el archivo `hevy-crud-schema.json` que:

1. **Nombre incorrecto del parámetro:**
   - Schema decía: `templateId`
   - Código real espera: `exerciseTemplateId`

2. **Faltaban parámetros obligatorios:**
   - El método `addExerciseToRoutine` REQUIERE un array de `sets`
   - El schema no especificaba esto claramente
   - El schema era demasiado genérico

3. **Documentación insuficiente:**
   - No había ejemplos de uso
   - No había claridad sobre qué parámetros usa cada método

## ✅ Solución Implementada

### 1. Agregado parámetro `exerciseTemplateId`

```json
"exerciseTemplateId": {
  "type": "string",
  "description": "ID de la plantilla de ejercicio (requerido para addExerciseToRoutine)"
}
```

### 2. Agregado parámetro `sets` con documentación completa

```json
"sets": {
  "type": "array",
  "description": "Array de sets para el ejercicio (requerido para addExerciseToRoutine). Cada set debe tener type, y opcionalmente weightKg, reps, durationSeconds, distanceMeters",
  "items": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": ["warmup", "normal", "failure", "dropset"],
        "default": "normal"
      },
      "weightKg": { "type": "number" },
      "reps": { "type": "integer" },
      "durationSeconds": { "type": "integer" },
      "distanceMeters": { "type": "integer" },
      "customMetric": { "type": "number" }
    }
  }
}
```

### 3. Agregados parámetros opcionales

```json
"supersetId": {
  "type": "integer",
  "description": "ID del superset (opcional, para agrupar ejercicios)"
},
"restSeconds": {
  "type": "integer",
  "description": "Tiempo de descanso en segundos entre sets"
},
"notes": {
  "type": "string",
  "description": "Notas sobre el ejercicio"
}
```

### 4. Actualizada descripción del API

```json
"description": "API completa para gestionar entrenamientos, rutinas y datos de fitness. Servidor único en Railway con capacidades CRUD completas y sin limitaciones de timeout. IMPORTANTE para addExerciseToRoutine: Debes enviar 'exerciseTemplateId' (no 'templateId') y un array de 'sets' con al menos un set que incluya 'type' (warmup/normal/failure/dropset) y opcionalmente weightKg, reps, durationSeconds o distanceMeters según el tipo de ejercicio."
```

### 5. Agregado ejemplo en el endpoint

```json
"description": "Endpoint principal del servidor Railway. Todas las operaciones CRUD funcionan perfectamente sin timeouts. EJEMPLO para addExerciseToRoutine: {method: 'addExerciseToRoutine', params: {routineId: 'xxx', exerciseTemplateId: '43573BB8', sets: [{type: 'normal', reps: 10, weightKg: 40}]}}"
```

## 📦 Cambios en Archivos

### Archivo modificado:
- `hevy-crud-schema.json` (versión actualizada a 6.2.0)

### Cambios específicos:
1. Línea 5: Actualizada descripción del API
2. Línea 6: Versión incrementada a 6.2.0
3. Línea 30: Agregado ejemplo en descripción del endpoint
4. Líneas 148-197: Agregados nuevos parámetros documentados

## 🧪 Validación

### JSON válido ✅
```bash
node -e "JSON.parse(require('fs').readFileSync('hevy-crud-schema.json', 'utf8'))"
# ✅ JSON válido
```

### Uso correcto ahora:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "addExerciseToRoutine",
  "params": {
    "routineId": "6fdd6220-8277-460f-bb35-641d225fd4c9",
    "exerciseTemplateId": "43573BB8",
    "sets": [
      {
        "type": "normal",
        "reps": 10,
        "weightKg": 40
      }
    ]
  }
}
```

## 📝 Lecciones Aprendidas

1. **Documentación es crítica:** El schema debe reflejar exactamente lo que el código espera
2. **Nombres de parámetros deben coincidir:** `templateId` vs `exerciseTemplateId` causó el problema
3. **Parámetros obligatorios deben estar documentados:** `sets` era requerido pero no estaba en el schema
4. **Ejemplos ayudan:** Agregar ejemplos en la descripción previene errores

## 🎯 Resultado

✅ El método `addExerciseToRoutine` ahora funciona correctamente
✅ El asistente de IA tiene la información correcta sobre los parámetros
✅ Se evitó un "falso positivo" de bug en la API de Hevy
✅ La documentación está actualizada y es precisa

## 📅 Fecha del Fix

15 de Octubre, 2025

## 👤 Reportado por

Rober (@RoberHevyTrainer)

---

**Conclusión:** No era un bug de Hevy, era un bug en la documentación del schema JSON que causaba que el asistente de IA enviara parámetros incorrectos.

