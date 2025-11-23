@echo off
echo ========================================
echo   PodzSpace - Complete Project Setup
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend npm install failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend npm install failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Setting up Database...
cd ..\backend
echo Please make sure you have updated the DATABASE_URL in backend\.env file
echo Press any key when ready to run migrations...
pause
call npm run prisma:generate
call npm run prisma:migrate
echo.

echo [4/4] Setup Complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Open TWO terminal windows
echo.
echo 2. In Terminal 1, run:
echo    cd backend
echo    npm run dev
echo.
echo 3. In Terminal 2, run:
echo    cd frontend  
echo    npm run dev
echo.
echo 4. Open browser to: http://localhost:5173
echo.
echo ========================================
echo   Good luck with your presentation!
echo ========================================
pause
