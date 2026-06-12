@echo off
setlocal

REM start.bat
REM Script para iniciar os containers n8n + MCP Server
REM Cria os diretórios necessários para persistência

REM Garante que o script rode sempre a partir do diretório onde ele está
cd /d "%~dp0"

echo Verificando se o Docker está instalado e no PATH...
where docker >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker não encontrado no PATH.
    echo - Verifique se o Docker Desktop está instalado e em execução.
    pause
    exit /b 1
)

echo Criando diretórios para persistência (ignora se já existirem)...
mkdir "%~dp0mcp_server" 2>nul
mkdir "%~dp0n8n_data" 2>nul

echo Iniciando os containers...
REM tenta usar docker-compose (legado), senão usa o novo 'docker compose'
where docker-compose >nul 2>&1
if errorlevel 0 (
    docker-compose up -d
) else (
    docker compose up -d
)

if errorlevel 1 (
    echo ERRO ao iniciar containers. Verifique se o Docker está em execucao.
    pause
    exit /b 1
)

echo.
echo Ambiente iniciado com sucesso!
echo Acesse o n8n em: http://localhost:5678
echo.
pause
