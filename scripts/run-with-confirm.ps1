param(
  [ValidateSet("install","dev","build","start")] 
  [string]$action = "dev"
)

$map = @{
  "install" = "npm install"
  "dev" = "npm run dev"
  "build" = "npm run build"
  "start" = "npm run start"
}

if (-not $map.ContainsKey($action)) {
  Write-Error "Unknown action: $action"
  exit 1
}

Write-Host "You are about to run: $($map[$action]) in $(Get-Location)"
$confirm = Read-Host "Proceed? (Y/N)"
if ($confirm -notin @("Y","y","Yes","yes")) {
  Write-Host "Cancelled by user."
  exit 0
}

Write-Host "Running: $($map[$action])`n"
# Run the command in the current PowerShell session so output streams to the terminal
Invoke-Expression $map[$action]
$exitCode = $LASTEXITCODE
Write-Host "`nCommand exited with code $exitCode"
exit $exitCode
