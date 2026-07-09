# PowerShell script to test search functionality
# Usage: .\test-search.ps1

param(
    [string]$ApiUrl = "http://localhost:3000",
    [string]$Query = "cars"
)

Write-Host "🧪 Search System Test" -ForegroundColor Cyan
Write-Host "======================================"
Write-Host ""

# Test 1: Basic Search
Write-Host "Test 1: Basic Search for '$Query'" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/search?q=$([System.Uri]::EscapeDataString($Query))" `
        -Headers @{ "Content-Type" = "application/json" } `
        -Method Get
    
    $data = $response.Content | ConvertFrom-Json
    $results = $data.data
    
    Write-Host "✅ Results: $($results.Count) items found" -ForegroundColor Green
    
    # Count by source
    $bySource = @{}
    foreach ($item in $results) {
        if (-not $bySource[$item.source]) {
            $bySource[$item.source] = 0
        }
        $bySource[$item.source]++
    }
    
    Write-Host "   Breakdown by source:" -ForegroundColor Cyan
    foreach ($source in ($bySource.Keys | Sort-Object)) {
        Write-Host "     - $($source): $($bySource[$source])" -ForegroundColor Gray
    }
    
    Write-Host "   Top 3 results:" -ForegroundColor Cyan
    $results | Select-Object -First 3 | ForEach-Object {
        Write-Host "     • $($_.title)" -ForegroundColor Gray
        Write-Host "       Source: $($_.source), Type: $($_.type)" -ForegroundColor DarkGray
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 2: AI Search" -ForegroundColor Yellow

$aiQuery = "machine learning"
$context = "I am a beginner, prefer video tutorials"

try {
    $body = @{
        query = $aiQuery
        aiContext = $context
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$ApiUrl/search/ai" `
        -Headers @{ "Content-Type" = "application/json" } `
        -Method Post `
        -Body $body
    
    $data = $response.Content | ConvertFrom-Json
    $results = $data.data
    
    Write-Host "✅ Results: $($results.Count) items found" -ForegroundColor Green
    
    Write-Host "   Top 3 results with AI scores:" -ForegroundColor Cyan
    $results | Select-Object -First 3 | ForEach-Object {
        $aiScore = $_.metadata.aiScore ?? "N/A"
        $aiExplanation = $_.metadata.aiExplanation ?? "No explanation"
        Write-Host "     • $($_.title)" -ForegroundColor Gray
        Write-Host "       AI Score: $aiScore, Source: $($_.source)" -ForegroundColor DarkGray
        Write-Host "       Explanation: $($aiExplanation.Substring(0, [Math]::Min(80, $aiExplanation.Length)))..." -ForegroundColor DarkGray
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 3: Specialized Search (GitHub User)" -ForegroundColor Yellow

$userQuery = "@torvalds"

try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/search?q=$([System.Uri]::EscapeDataString($userQuery))" `
        -Headers @{ "Content-Type" = "application/json" } `
        -Method Get
    
    $data = $response.Content | ConvertFrom-Json
    $results = $data.data
    
    Write-Host "✅ Results: $($results.Count) items found" -ForegroundColor Green
    
    Write-Host "   Results:" -ForegroundColor Cyan
    $results | Select-Object -First 5 | ForEach-Object {
        Write-Host "     • $($_.title) ($($_.type))" -ForegroundColor Gray
        Write-Host "       URL: $($_.url)" -ForegroundColor DarkGray
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Tests complete!" -ForegroundColor Green
