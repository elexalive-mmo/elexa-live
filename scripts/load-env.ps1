$envPath = ".env"
if (Test-Path $envPath) { Write-Host "Loading env from $envPath"; Get-Content $envPath | ForEach-Object { $p = $_.Split('='); if ($p.Length -eq 2) { [Environment]::SetEnvironmentVariable($p[0], $p[1], 'Process') } } }
