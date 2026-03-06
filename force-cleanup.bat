@echo off
echo FORCE CLEANUP - Removing old backend directory...
echo.

echo Closing all processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im code.exe >nul 2>&1
taskkill /f /im vscode.exe >nul 2>&1

echo Waiting for processes to close...
timeout /t 2 /nobreak >nul

echo Force removing old backend directory...
rmdir /s /q "backend" >nul 2>&1

echo Force removing old frontend directory...
rmdir /s /q "frontend" >nul 2>&1

echo.
echo Checking if directories still exist...
if exist "backend" (
    echo WARNING: backend directory still exists!
    echo Trying alternative method...
    rd /s /q "backend" >nul 2>&1
) else (
    echo SUCCESS: backend directory removed!
)

if exist "frontend" (
    echo WARNING: frontend directory still exists!
    echo Trying alternative method...
    rd /s /q "frontend" >nul 2>&1
) else (
    echo SUCCESS: frontend directory removed!
)

echo.
echo Final structure check:
dir /b /ad

echo.
echo Cleanup completed! You should now only see:
echo - packages\frontend\
echo - packages\backend\
echo - node_modules\
echo.
pause
