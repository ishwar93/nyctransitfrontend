@echo off
REM Build MBTiles for Martin (martin.yaml) + Map.tsx (zoom 14-15).
REM Requires Docker.
REM Usage:
REM   scripts\tippecanoe-transit.cmd [input_file] [output_file] [output_dir]
REM Examples:
REM   scripts\tippecanoe-transit.cmd
REM   scripts\tippecanoe-transit.cmd public/transit_stops.geojsonseq transit_stops.mbtiles public
REM Defaults:
REM   input_file  = public/transit_stops.geojsonseq
REM   output_file = transit_stops.mbtiles
REM   output_dir  = public

cd /d "%~dp0.."

set "INPUT_FILE=%~1"
if "%INPUT_FILE%"=="" set "INPUT_FILE=public/transit_stops.geojsonseq"

set "OUTPUT_FILE=%~2"
if "%OUTPUT_FILE%"=="" set "OUTPUT_FILE=transit_stops.mbtiles"

set "OUTPUT_DIR=%~3"
if "%OUTPUT_DIR%"=="" set "OUTPUT_DIR=public"

set "OUTPUT_PATH=%OUTPUT_DIR%/%OUTPUT_FILE%"

docker run --rm -v "%CD%:/work" -w /work ghcr.io/jtmiclat/tippecanoe-docker:latest tippecanoe -o "%OUTPUT_PATH%" -l transit_routegeom --minimum-zoom=14 --maximum-zoom=15 --force --read-parallel "%INPUT_FILE%"
