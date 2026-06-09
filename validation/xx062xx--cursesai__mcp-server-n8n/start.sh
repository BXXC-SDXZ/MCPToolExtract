#!/bin/bash

# start.sh
# Script para iniciar os containers n8n + MCP Server
# Cria os diretórios necessários para persistência

echo "Criando diretórios para persistência..."
mkdir -p mcp_server
mkdir -p n8n_data

echo "Iniciando os containers..."
docker-compose up -d

echo "Ambiente iniciado com sucesso!"
echo "Acesse o n8n em: http://localhost:5678"