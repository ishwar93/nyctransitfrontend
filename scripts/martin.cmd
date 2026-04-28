@echo off
REM Martin on http://localhost:3000 — serves MBTiles from public/ (see martin.yaml).
REM Vite proxies /vector/transit_stops and /tiles → this server. Stop with Ctrl+C.

cd /d "%~dp0.."

docker run --rm -p 3000:3000 ^
  -e MARTIN_TILES_DIR=/tiles ^
  -v "%CD%\public:/tiles" ^
  -v "%CD%\martin.yaml:/config/martin.yaml:ro" ^
  ghcr.io/maplibre/martin:latest ^
  --config /config/martin.yaml
