# Test 1: GPT inventa routine ID - simulando error típico
Write-Host "🧪 TEST 1: addExerciseToRoutine con routine ID INVENTADO" -ForegroundColor Yellow
Write-Host "Simulando: GPT inventa '12345678-fake-id' como routine ID"
Write-Host ""

$body = @{
    jsonrpc = "2.0"
    id = 1
    method = "addExerciseToRoutine"
    params = @{
        routineId = "12345678-fake-id"  # ❌ ID inventado por el GPT
        exerciseTemplateId = "93A552C6"  # ✅ ID válido
        sets = @(
            @{
                type = "normal"
                reps = 12
                weightKg = 20
            }
        )
    }
} | ConvertTo-Json -Depth 10

Write-Host "📤 Enviando request con routine ID inválido..."

$response = Invoke-WebRequest -Uri "https://hevy-mcp-production.up.railway.app/mcp" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction Continue

Write-Host "📊 RESULTADO:" -ForegroundColor Green
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10