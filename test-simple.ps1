Write-Host "Testing defensive validations..." -ForegroundColor Yellow

$headers = @{
    'Content-Type' = 'application/json'
}

# Test: Clearly invalid routine ID
$body = @{
    jsonrpc = "2.0"
    id = 1
    method = "addExerciseToRoutine"  
    params = @{
        routineId = "ABC123"
        exerciseTemplateId = "93A552C6"
        sets = @(@{ type = "normal"; reps = 12; weightKg = 20 })
    }
} | ConvertTo-Json -Depth 5

Write-Host "Test: Invalid routine ID format"
Write-Host "Sending routineId: ABC123 (should trigger validation error)"

try {
    $response = Invoke-RestMethod -Uri "https://hevy-mcp-production.up.railway.app/mcp" -Method POST -Headers $headers -Body $body
    Write-Host "Response received:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error caught:"
    $_.Exception.Message
}