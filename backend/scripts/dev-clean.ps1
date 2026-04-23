Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodemonCmd = Join-Path $projectRoot "node_modules\.bin\nodemon.cmd"

if (-not (Test-Path $nodemonCmd)) {
  throw "No se encontro nodemon en $nodemonCmd. Ejecuta npm install dentro de backend."
}

Push-Location $projectRoot
try {
  # Limpia preloads de depuracion rotos que a veces deja VS Code en el terminal.
  foreach ($name in @("NODE_OPTIONS", "VSCODE_INSPECTOR_OPTIONS", "VSCODE_CWD", "VSCODE_PID")) {
    if (Test-Path ("Env:" + $name)) {
      Remove-Item ("Env:" + $name) -ErrorAction SilentlyContinue
    }
  }

  & $nodemonCmd "--experimental-specifier-resolution=node" "--exec" "node --loader ts-node/esm" "src/index.ts"
}
finally {
  Pop-Location
}
