mod models;
mod prompts;
mod resources;
mod sqlite;
mod tools;

use anet_mcp_server::{ServerBuilder, ServerCapabilities, transport::nats::NatsTransport};
use anyhow::Result;
use dotenv::dotenv;
use serde_json::json;
use std::env;
use std::path::Path;
use std::sync::Arc;
use tracing::{debug, error, info, warn};
use tracing_subscriber::{EnvFilter, fmt::format::FmtSpan};

use crate::sqlite::SqliteDatabase;
use crate::tools::append_insight::AppendInsightTool;
use crate::tools::create_table::CreateTableTool;
use crate::tools::describe_table::DescribeTableTool;
use crate::tools::list_tables::ListTablesTool;
use crate::tools::read_query::ReadQueryTool;
use crate::tools::write_query::WriteQueryTool;

#[tokio::main]
async fn main() -> Result<()> {
    // Load .env file if it exists
    let dotenv_result = dotenv();
    match dotenv_result {
        Ok(_) => debug!("Loaded environment from .env file"),
        Err(e) => warn!("Could not load .env file: {}", e),
    }

    // Initialize logging
    let filter = if let Ok(log_level) = env::var("RUST_LOG") {
        EnvFilter::new(log_level)
    } else {
        EnvFilter::new("debug")
    };

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_span_events(FmtSpan::CLOSE)
        .init();

    info!("Starting SQLite MCP server");

    // Get database path from environment or use default
    let db_path = env::var("SQLITE_DB_PATH").unwrap_or_else(|_| "./data/sqlite.db".to_string());
    info!("Using database path: {}", db_path);

    // Initialize SQLite database
    let db = match SqliteDatabase::new(Path::new(&db_path)) {
        Ok(db) => {
            info!("Database initialized successfully");
            db
        }
        Err(e) => {
            error!("Failed to initialize database: {}", e);
            return Err(anyhow::anyhow!("Failed to initialize database: {}", e));
        }
    };

    // Create NATS transport
    let nats_url = env::var("NATS_URL").unwrap_or_else(|_| "nats://localhost:4222".to_string());
    let subject = env::var("MCP_SUBJECT").unwrap_or_else(|_| "mcp.requests".to_string());

    info!("Connecting to NATS at {} on subject {}", nats_url, subject);
    let transport = match NatsTransport::new(&nats_url, &subject).await {
        Ok(t) => t,
        Err(e) => {
            error!("Failed to connect to NATS: {}", e);
            return Err(anyhow::anyhow!("Failed to connect to NATS: {}", e));
        }
    };
    info!("Successfully connected to NATS");
    
    // Initialize tools
    info!("Initializing SQLite tools...");
    let read_query_tool = ReadQueryTool::new(Arc::clone(&db));
    let write_query_tool = WriteQueryTool::new(Arc::clone(&db));
    let create_table_tool = CreateTableTool::new(Arc::clone(&db));
    let list_tables_tool = ListTablesTool::new(Arc::clone(&db));
    let describe_table_tool = DescribeTableTool::new(Arc::clone(&db));
    let append_insight_tool = AppendInsightTool::new(Arc::clone(&db));

    // Create server builder
    let server_builder = ServerBuilder::new()
        .transport(transport)
        .name("sqlite-mcp")
        .version("0.1.0")
        .capabilities(ServerCapabilities {
            tools: Some(json!({})),
            prompts: Some(json!({})),
            resources: Some(json!({})),
            notification_options: None,
            experimental_capabilities: None,
        })
        .add_tool(read_query_tool)
        .add_tool(write_query_tool)
        .add_tool(create_table_tool)
        .add_tool(list_tables_tool)
        .add_tool(describe_table_tool)
        .add_tool(append_insight_tool);

    // Build server
    info!("Building MCP server...");
    let server = server_builder.build()?;

    // Run server
    info!("Server built, ready to run!");
    info!("Listening for requests on NATS subject: {}", subject);
    server.run().await
}
