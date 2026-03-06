#!/bin/bash
echo "========================================"
echo "  SaaS Dashboard - Monorepo Starter"
echo "========================================"
echo

echo "[1/4] Installing dependencies..."
npm install || { echo "ERROR: Failed to install dependencies"; exit 1; }

echo
echo "[2/4] Building backend..."
npm run build:backend || { echo "ERROR: Failed to build backend"; exit 1; }

echo
echo "[3/4] Building frontend..."
npm run build:frontend || { echo "ERROR: Failed to build frontend"; exit 1; }

echo
echo "[4/4] Starting servers..."
echo
echo "Backend API: http://localhost:3001"
echo "Frontend App: http://localhost:3000"
echo
echo "Default Login Credentials:"
echo "  Super Admin: superadmin@saas.com / SuperPass123!"
echo "  Admin:       admin@saas.com / AdminPass123!"
echo "  User:        user@saas.com / UserPass123!"
echo
echo "Press Ctrl+C to stop servers"
echo

# Start both servers in background
npm run dev:backend &
BACKEND_PID=$!
sleep 3
npm run dev:frontend &
FRONTEND_PID=$!

echo
echo "========================================"
echo "  Servers are running..."
echo "  Backend: http://localhost:3001"
echo "  Frontend: http://localhost:3000"
echo "========================================"
echo

# Wait for interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
