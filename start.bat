@echo off
REM ============================================
REM Askly — Start Script (Windows)
REM ============================================

echo.
echo  ╔════════════════════════════════════════╗
echo  ║         ASKLY — Launching...           ║
echo  ╚════════════════════════════════════════╝
echo.

REM ── 1. Start the Python FastAPI backend ──
echo [1/3] Starting AI Backend (port 8000)...
start "Askly Backend" cmd /c "uvicorn main:app --reload --host 0.0.0.0 --port 8000 & pause"

REM ── 2. Start the Node.js Express frontend ──
echo [2/3] Starting Frontend Server (port 3000)...
start "Askly Frontend" cmd /c "node server.js & pause"

REM ── 3. Wait a moment then open Edge ──
echo.
echo [3/3] Opening Microsoft Edge to http://localhost:3000 ...
timeout /t 3 /nobreak >nul
start msedge http://localhost:3000

echo.
echo  ✅ Both servers are starting up.
echo     Frontend: http://localhost:3000
echo     Backend:  http://localhost:8000
echo.
echo  ⚠️  Make sure OPENROUTER_API_KEY is set!
echo     $env:OPENROUTER_API_KEY = "sk-or-..."
echo.
pause