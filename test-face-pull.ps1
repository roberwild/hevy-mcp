Write-Host "Testing Face Pull search post-deployment..." -ForegroundColor Green

$headers = @{ 'Content-Type' = 'application/json' }

$body = @{
    jsonrpc = "2.0"
    id = 1
    method = "searchExerciseTemplates"  
    params = @{
        query = "Face Pull"
        limit = 5
    }
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri "https://hevy-mcp-production.up.railway.app/mcp" -Method POST -Headers $headers -Body $body
    
    Write-Host "Results: $($response.result.exerciseTemplates.count)" -ForegroundColor Yellow
    
    $facePullFound = $false
    foreach ($exercise in $response.result.exerciseTemplates) {
        Write-Host "  - ID: $($exercise.id) | Title: $($exercise.title) | Spanish: $($exercise.spanishTitle)" -ForegroundColor White
        if ($exercise.id -eq "BE640BA0") {
            Write-Host "    *** FACE PULL FOUND! ***" -ForegroundColor Green
            $facePullFound = $true
        }
    }
    
    if (-not $facePullFound) {
        Write-Host "❌ Face Pull NOT found in results" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
