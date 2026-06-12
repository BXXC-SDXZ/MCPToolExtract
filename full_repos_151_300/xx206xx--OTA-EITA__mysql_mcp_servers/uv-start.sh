#!/bin/bash
source ~/.profile  # or ~/.bashrc depending on where PATH is set

# PYTHONPATH を設定
export PYTHONPATH="$(dirname "$0")/src/mysql_mcp_server:$PYTHONPATH"

cd "$(dirname "$0")/src/mysql_mcp_server"
uv run server.py
