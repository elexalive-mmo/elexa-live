$src = "C:\Users\justi\.openclaw\media\inbound"
$dst = "C:\Users\justi\elexalive\elexalive\workspace\projects\elexa-live\media\inbound"

if (-Not (Test-Path $dst)) {
    New-Item -Path $dst -ItemType Directory -Force
}

Get-ChildItem -Path $src -File | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $dst $_.Name) -Force
    Write-Host "Copied: $($_.Name)"
}

Write-Host "Done. All media copied to project folder."
