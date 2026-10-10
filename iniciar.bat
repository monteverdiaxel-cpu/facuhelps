@echo off
title Gemini Audio Transcriber
cd /d "%~dp0"
echo ===================================================
echo     Iniciando Gemini Audio Transcriber
echo ===================================================
echo.

:: Abrir automaticamente el navegador web en 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8000"

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Servidor iniciado. Abriendo http://localhost:8000 en tu navegador...
    python app.py
) else (
    if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
        echo Servidor iniciado. Abriendo http://localhost:8000 en tu navegador...
        "%LOCALAPPDATA%\Python\bin\python.exe" app.py
    ) else (
        echo [ERROR] No se encontro Python instalado. Por favor instala Python y agregalo al PATH.
        pause
    )
)
pause
