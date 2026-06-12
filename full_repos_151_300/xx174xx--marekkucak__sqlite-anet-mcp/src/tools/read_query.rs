use anet_mcp_server::{Content, Tool};
use anyhow::Result;
use async_trait::async_trait;
use serde_json::{json, Value};
use tracing::{debug, error};

use crate::models::sqlite::QueryParams;
use crate::sqlite::SqliteDatabase;
use std::sync::Arc;

pub struct ReadQueryTool {
    db: Arc<SqliteDatabase>,
}

impl ReadQueryTool {
    pub fn new(db: Arc<SqliteDatabase>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl Tool for ReadQueryTool {
    fn name(&self) -> String {
        "read_query".to_string()
    }

    fn description(&self) -> String {
        "Execute a SELECT query on the SQLite database".to_string()
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "SELECT SQL query to execute"
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

        debug!("ReadQueryTool called with query: {}", params.query);

        if !params.query.trim().to_uppercase().starts_with("SELECT") {
            error!("Invalid SELECT statement: {}", params.query);
            return Err(anyhow::anyhow!("Only SELECT queries are allowed for read_query"));
        }

        match self.db.execute_query(&params.query, None).await {
            Ok(results) => {
                debug!("Query executed successfully, returned {} rows", results.len());
                Ok(vec![Content::Text { 
                    text: serde_json::to_string_pretty(&results)? 
                }])
            }
            Err(e) => {
                error!("Error executing query: {}", e);
                Err(anyhow::anyhow!("Error executing query: {}", e))
            }
        }
    }
}
