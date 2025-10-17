Write-Host "Testing search functionality with fuzzy matching" -ForegroundColor Yellow
Write-Host ""

$headers = @{
    'Content-Type' = 'application/json'
}

# Test 1: Exact match "Face Pull"
Write-Host "Test 1: Searching for 'Face Pull' (exact)" -ForegroundColor Cyan
$body1 = @{
    jsonrpc = "2.0"
    id = 1
    method = "searchExerciseTemplates"  
    params = @{
        query = "Face Pull"
        limit = 10
    }
} | ConvertTo-Json -Depth 5

try {
    $response1 = Invoke-RestMethod -Uri "https://hevy-mcp-production.up.railway.app/mcp" -Method POST -Headers $headers -Body $body1
    Write-Host "Results found: $($response1.result.exerciseTemplates.count)" -ForegroundColor Green
    
    foreach ($exercise in $response1.result.exerciseTemplates) {
        Write-Host "  - ID: $($exercise.id) | Title: $($exercise.title) | Spanish: $($exercise.spanishTitle)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Lowercase "face pull"
Write-Host "Test 2: Searching for 'face pull' (lowercase)" -ForegroundColor Cyan
$body2 = @{
    jsonrpc = "2.0"
    id = 1
    method = "searchExerciseTemplates"  
    params = @{
        query = "face pull"
        limit = 10
    }
} | ConvertTo-Json -Depth 5

try {
    $response2 = Invoke-RestMethod -Uri "https://hevy-mcp-production.up.railway.app/mcp" -Method POST -Headers $headers -Body $body2
    Write-Host "Results found: $($response2.result.exerciseTemplates.count)" -ForegroundColor Green
    
    foreach ($exercise in $response2.result.exerciseTemplates) {
        Write-Host "  - ID: $($exercise.id) | Title: $($exercise.title) | Spanish: $($exercise.spanishTitle)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Spanish "tiron cara"
Write-Host "Test 3: Searching for 'tiron cara' (Spanish)" -ForegroundColor Cyan
$body3 = @{
    jsonrpc = "2.0"
    id = 1
    method = "searchExerciseTemplates"  
    params = @{
        query = "tiron cara"
        limit = 10
    }
} | ConvertTo-Json -Depth 5

try {
    $response3 = Invoke-RestMethod -Uri "https://hevy-mcp-production.up.railway.app/mcp" -Method POST -Headers $headers -Body $body3
    Write-Host "Results found: $($response3.result.exerciseTemplates.count)" -ForegroundColor Green
    
    foreach ($exercise in $response3.result.exerciseTemplates) {
        Write-Host "  - ID: $($exercise.id) | Title: $($exercise.title) | Spanish: $($exercise.spanishTitle)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Expected: ID BE640BA0, Face Pull, Tiron a la cara" -ForegroundColor Yellow