@echo off
echo Cleaning up duplicate directories...
echo.

echo Closing any processes using frontend/backend folders...
taskkill /f /im node.exe 2>nul
taskkill /f /im code.exe 2>nul

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Removing old frontend directory...
rmdir /s /q frontend 2>nul

echo Removing old backend directory...
rmdir /s /q backend 2>nul

echo.
echo Cleanup complete! Now you have only the monorepo structure:
echo - packages\frontend\ (React app)
echo - packages\backend\ (Node.js API)
echo.
echo No more duplicates!
echo.
pause
