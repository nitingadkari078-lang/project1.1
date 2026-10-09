@echo off
title MediVault Server
echo ========================================
echo Launching MediVault Local Server
echo ========================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
