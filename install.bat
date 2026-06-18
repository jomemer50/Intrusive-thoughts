@echo off

echo =========================================
echo   Rungtatron Installation Script
echo =========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

:: Install dependencies
echo [INFO] Installing npm dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install npm dependencies.
    pause
    exit /b 1
)
echo [INFO] Dependencies installed successfully.
echo.

:: Setup environment variables
if exist ".env.local" goto env_exists

echo [INFO] Setting up environment variables...
set /p API_KEY="Please enter your OpenRouter API Key: "
echo OPENROUTER_API_KEY=%API_KEY%> .env.local
echo [INFO] .env.local created successfully.
goto end_env

:env_exists
echo [INFO] .env.local already exists. Skipping environment setup.

:end_env
echo.
echo =========================================
echo   Installation Complete!
echo =========================================
echo.
echo To start the application, run:
echo    npm run dev
echo.
pause
