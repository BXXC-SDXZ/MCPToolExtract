use anet_mcp_server::{Content, Tool};
use anyhow::Result;
use async_trait::async_trait;
use serde_json::{json, Value};
use tracing::{debug, error};

use crate::models::sqlite::QueryParams;
use crate::sqlite::SqliteDatabase;
use std::sync::Arc;

pub struct WriteQueryTool {
    db: Arc<SqliteDatabase>,
}

impl WriteQueryTool {
    pub fn new(db: Arc<SqliteDatabase>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl Tool for WriteQueryTool {
    fn name(&self) -> String {
        "write_query".to_string()
    }

    fn description(&self) -> String {
        "Execute an INSERT, UPDATE, or DELETE query on the SQLite database".to_string()
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "SQL query to execute"
                }
            },
            "required": ["query"]
        })
    }

    async fn call(&self, input: Option<Value>) -> Result<Vec<Content>> {
        let params = match input {
            Some(value) => serde_json::from_value::<QueryParams>(value)?,
            None => return Err(anyhow::anyhow!("Missing query parameter")),
        };

        debug!("WriteQueryTool called with query: {}", params.query);

        let query_upper = params.query.trim().to_uppercase();
        if query_upper.starts_with("SELECT") {
            error!("SELECT queries are not allowed for write_query");
            return Err(anyhow::anyhow!("SELECT queries are not allowed for write_query"));
        }

        if !(query_upper.starts_with("INSERT") || 
             query_upper.starts_with("UPDATE") || 
             query_upper.starts_with("DELETE")) {
            error!("Only INSERT, UPDATE, or DELETE queries are allowed");
            return Err(anyhow::anyhow!("Only INSERT, UPDATE, or DELETE queries are allowed"));
        }

        match self.db.execute_query(&params.query, None).await {
            Ok(result) => {
                debug!("Query executed successfully");
                Ok(vec![Content::Text { 
                    text: serde_json::to_string_pretty(&result)? 
                }])
            }
            Err(e) => {
                error!("Error executing query: {}", e);
                Err(anyhow::anyhow!("Error executing query: {}", e))
            }
        }
    }
}
