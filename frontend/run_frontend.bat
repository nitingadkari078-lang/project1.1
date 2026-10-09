@echo off
echo ========================================
echo MediVault Frontend
echo ========================================
echo.

REM Check Node.js installation
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Node.js is not detected in PATH.
    echo Launching MediVault standalone application directly in your default browser...
    echo.
    start "" "%~dp0public\index.html"
    echo Application opened in browser!
    echo To run the Vite development server in the future, install Node.js from https://nodejs.org/
    timeout /t 5 >nul
    exit /b 0
)

REM Check if node_modules exists
if not exist "%~dp0node_modules" (
    echo Installing dependencies...
    cd /d "%~dp0"
    call npm install
    echo.
    echo Starting Vite dev server on port 5173...
) else (
    echo Starting Vite dev server on port 5173...
    cd /d "%~dp0"
)

echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev
