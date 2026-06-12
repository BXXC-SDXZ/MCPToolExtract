use anet_mcp_server::{Content, Tool};
use anyhow::Result;
use async_trait::async_trait;
use serde_json::{Value, json};
use tracing::{debug, error};

use crate::sqlite::SqliteDatabase;
use std::sync::Arc;

pub struct ListTablesTool {
    db: Arc<SqliteDatabase>,
}

impl ListTablesTool {
    pub fn new(db: Arc<SqliteDatabase>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl Tool for ListTablesTool {
    fn name(&self) -> String {
        "list_tables".to_string()
    }

    fn description(&self) -> String {
        "List all tables in the SQLite database".to_string()
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {}
        })
    }

    async fn call(&self, _input: Option<Value>) -> Result<Vec<Content>> {
        debug!("ListTablesTool called");

        match self.db.list_tables().await {
            Ok(tables) => {
                debug!("Tables retrieved successfully: {:?}", tables);
                Ok(vec![Content::Text {
                    text: serde_json::to_string_pretty(&tables)?,
                }])
            }
            Err(e) => {
                error!("Error listing tables: {}", e);
                Err(anyhow::anyhow!("Error listing tables: {}", e))
            }
        }
    }
}
