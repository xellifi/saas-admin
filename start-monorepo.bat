@echo off
echo ========================================
echo   SaaS Dashboard - Monorepo Starter
echo ========================================
echo.

echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Building backend...
call npm run build:backend
if errorlevel 1 (
    echo ERROR: Failed to build backend
    pause
    exit /b 1
)

echo.
echo [3/4] Building frontend...
call npm run build:frontend
if errorlevel 1 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)

echo.
echo [4/4] Starting servers...
echo.
echo Backend API: http://localhost:3001
echo Frontend App: http://localhost:3000
echo.
echo Default Login Credentials:
echo   Super Admin: superadmin@saas.com / SuperPass123!
echo   Admin:       admin@saas.com / AdminPass123!
echo   User:        user@saas.com / UserPass123!
echo.
echo Press Ctrl+C to stop servers
echo.

start "Backend API" cmd /k "npm run dev:backend"
timeout /t 3 /nobreak >nul
start "Frontend App" cmd /k "npm run dev:frontend"

echo.
echo ========================================
echo   Servers are starting...
echo   Backend: http://localhost:3001
echo   Frontend: http://localhost:3000
echo ========================================
echo.
pause
