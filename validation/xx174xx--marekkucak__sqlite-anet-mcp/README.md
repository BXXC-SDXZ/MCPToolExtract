# SQLite-Anet-MCP Server

A Rust implementation of the **Model Control Protocol (MCP)** server that provides SQLite database capabilities via a standardized protocol. This server enables AI agents to create, manage, and query SQLite databases directly.

This project is based on the [Model Context Protocol SQLite Server](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite) reference implementation.

---

## Features

- 🗃️ Create and manage SQLite database tables
- 🔍 Execute SELECT queries for data retrieval
- ✏️ Execute INSERT, UPDATE, and DELETE queries for data manipulation
- 📊 Describe table schemas and list available tables
- 📝 Save and synthesize business insights from data
- 🔄 NATS transport layer for message passing
- 🛠️ JSON-RPC 2.0 compatible API
- ⚡ Asynchronous request handling with Tokio

---

## Requirements

- **Rust** 1.70+
- **NATS** server running locally or accessible via network
- **SQLite** (included as a Rust dependency)

---

## Installation

Clone the repository and build the server:

```bash
git clone https://github.com/yourusername/sqlite-anet-mcp.git
cd sqlite-anet-mcp
```

Configure your environment in a `.env` file:

```
NATS_URL=nats://localhost:4222
MCP_SUBJECT=mcp.requests
SQLITE_DB_PATH=./data/sqlite.db
RUST_LOG=debug
```

---

## Getting Started

### Running the Server

```bash
# Start a NATS server in another terminal or ensure one is already running
# Example:
nats-server

# Run the SQLite MCP server
cargo run
```

### Testing the Server

You can test the server using the included test client:

```bash
cargo run --example test_client
```

This will set up a basic customer database and demonstrate the server's capabilities.

### Chinook Database Test

To run the Chinook database test example:

```bash
cargo run --example chinook_test
```

**Note:** Before running the Chinook test, you need to:

1. Download the Chinook SQLite database from: https://www.sqlitetutorial.net/sqlite-sample-database/
2. Place the `chinook.db` file in the `./data/` directory
3. Set `SQLITE_DB_PATH=./data/chinook.db` in your `.env` file or when running the example

---

## Available Tools

### 1. list_tables

List all tables in the SQLite database.

**Example:**

```json
{
  "name": "list_tables",
  "arguments": {}
}
```

### 2. describe_table

Get the schema information for a specific table.

**Parameters:**

- `table_name` (required): Name of the table to describe

**Example:**

```json
{
  "name": "describe_table",
  "arguments": {
    "table_name": "customers"
  }
}
```

### 3. create_table

Create a new table in the SQLite database.

**Parameters:**

- `query` (required): CREATE TABLE SQL statement

**Example:**

```json
{
  "name": "create_table",
  "arguments": {
    "query": "CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, join_date TEXT)"
  }
}
```

### 4. read_query

Execute a SELECT query on the SQLite database.

**Parameters:**

- `query` (required): SELECT SQL query to execute

**Example:**

```json
{
  "name": "read_query",
  "arguments": {
    "query": "SELECT * FROM customers WHERE join_date > '2023-01-01'"
  }
}
```

### 5. write_query

Execute an INSERT, UPDATE, or DELETE query on the SQLite database.

**Parameters:**

- `query` (required): SQL query to execute (must be INSERT, UPDATE, or DELETE)

**Example:**

```json
{
  "name": "write_query",
  "arguments": {
    "query": "INSERT INTO customers (name, email, join_date) VALUES ('John Doe', 'john@example.com', '2023-01-15')"
  }
}
```

### 6. append_insight

Add a business insight to the memo.

**Parameters:**

- `insight` (required): Business insight discovered from data analysis

**Example:**

```json
{
  "name": "append_insight",
  "arguments": {
    "insight": "Customer acquisition is stable and growing over time."
  }
}
```

---

## Available Resources

### Business Insights Memo

A living document of discovered business insights.

**URI:** `memo://insights`

**Example:**

```json
{
  "method": "readResource",
  "params": {
    "uri": "memo://insights"
  }
}
```

---

## Available Prompts

### MCP Demo

A prompt to seed the database with initial data and demonstrate what you can do with an SQLite MCP Server + Claude.

**Arguments:**

- `topic` (required): Topic to seed the database with initial data

**Example:**

```json
{
  "method": "getPrompt",
  "params": {
    "name": "mcp-demo",
    "arguments": {
      "topic": "coffee shop sales"
    }
  }
}
```

---

## Architecture

The server follows a modular design:

- **tools** – SQLite database operations implementations
- **models** – SQLite query and response structures
- **prompts** – Interactive demo templates
- **resources** – Business insights memo generation
- **sqlite** – Core database functionality

---

## Development

### Adding New Features

To extend the server with additional SQLite capabilities:

1. Define response structures in `src/models/sqlite.rs`
2. Implement the tool in `src/tools/` following the Tool trait
3. Register the tool in `src/main.rs`

---

## Troubleshooting

- Ensure the NATS server is running and accessible
- Check that the SQLite database path is correctly set
- Verify the request format matches the expected input schema for each tool

---

## License

MIT License

---

## Acknowledgements

This project is built on top of the [Anet MCP Server](https://github.com/marekkucak/anet-mcp-server) framework and is based on the [Model Context Protocol SQLite Server](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite) reference implementation.
