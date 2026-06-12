# MCP Server Demo

Este é um projeto de demonstração para um servidor MCP (Multi-Channel Protocol). Ele serve como exemplo para implementação e testes de funcionalidades relacionadas ao protocolo MCP.

## Funcionalidades

- Implementação básica do servidor MCP.
- Suporte a múltiplos canais de comunicação.
- Estrutura modular para fácil extensão.

## Requisitos

- Python 3.12 ou superior
- Dependências listadas no arquivo `pyproject.toml`

## Instalação

1. Clone este repositório:
    ```bash
    git clone https://github.com/pedro2s/mcp-server-demo-py.git
    ```
2. Navegue até o diretório do projeto:
    ```bash
    cd mcp-server-demo
    ```
3. Instale as dependências:
    ```bash
    uv pip install -r project.toml
    ```

## Uso

1. Inicie o servidor:
    ```bash
    uv run mcp install main.py
    ```
2. Conecte-se ao servidor usando um cliente MCP compatível.

## Estrutura do Projeto

- `main.py`: Arquivo principal para iniciar o servidor.