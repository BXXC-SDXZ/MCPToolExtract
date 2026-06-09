import os

# server.py
from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("AI Sticky Notes")


NOTES_FILE = os.path.join(os.path.dirname(__file__), "notes.txt")

def ensure_file():
    if not os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, "w") as f:
            f.write("")
    

@mcp.tool()
def add_note(message: str) -> str:
    """
    Adiciona uma nova nota ao arquivo de notas.
    Args:
        message (str): A mensagem da nota a ser adicionada.
    Returns:
        str: Mensagem de confirmação indicando que a nota foi salva.
    """
    ensure_file()
    with open(NOTES_FILE, "a") as f:
        f.write(message + "\n")
    return "Nota salva!"