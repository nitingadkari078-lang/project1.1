@echo off
echo ========================================
echo MediVault Server
echo ========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
    echo Installing dependencies...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

echo.
REM Set environment variables
set DATABASE_URL=postgresql://medivault:medivault_password@localhost:5432/medivault
set SECRET_KEY=your-secret-key-change-this-in-production
set GOOGLE_CLIENT_ID=your-google-client-id
set GOOGLE_CLIENT_SECRET=your-google-client-secret
set REDIRECT_URI=http://localhost:5173

echo Starting FastAPI server on port 8000...
echo Backend will be available at: http://localhost:8000
echo API docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

