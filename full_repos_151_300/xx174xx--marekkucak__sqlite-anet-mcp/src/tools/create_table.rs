use anet_mcp_server::{Content, Tool};
use anyhow::Result;
use async_trait::async_trait;
use serde_json::{json, Value};
use tracing::{debug, error};

use crate::models::sqlite::CreateTableParams;
use crate::sqlite::SqliteDatabase;
use std::sync::Arc;

pub struct CreateTableTool {
    db: Arc<SqliteDatabase>,
}

impl CreateTableTool {
    pub fn new(db: Arc<SqliteDatabase>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl Tool for CreateTableTool {
    fn name(&self) -> String {
        "create_table".to_string()
    }

    fn description(&self) -> String {
        "Create a new table in the SQLite database".to_string()
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "CREATE TABLE SQL statement"
                }
            },
            "required": ["query"]
        })
    }

    async fn call(&self, input: Option<Value>) -> Result<Vec<Content>> {
        let params = match input {
            Some(value) => serde_json::from_value::<CreateTableParams>(value)?,
            None => return Err(anyhow::anyhow!("Missing query parameter")),
        };

        debug!("CreateTableTool called with query: {}", params.query);

        if !params.query.trim().to_uppercase().starts_with("CREATE TABLE") {
            error!("Invalid CREATE TABLE statement: {}", params.query);
            return Err(anyhow::anyhow!("Only CREATE TABLE statements are allowed"));
        }

        match self.db.execute_query(&params.query, None).await {
            Ok(_) => {
                debug!("Table created successfully");
                Ok(vec![Content::Text { 
                    text: "Table created successfully".to_string() 
                }])
            }
            Err(e) => {
                error!("Error creating table: {}", e);
                Err(anyhow::anyhow!("Error creating table: {}", e))
            }
        }
    }
}
