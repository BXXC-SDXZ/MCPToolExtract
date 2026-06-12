use anet_mcp_server::{Content, Tool};
use anyhow::Result;
use async_trait::async_trait;
use serde_json::{Value, json};
use tracing::{debug, error};

use crate::models::sqlite::TableNameParams;
use crate::sqlite::SqliteDatabase;
use std::sync::Arc;

pub struct DescribeTableTool {
    db: Arc<SqliteDatabase>,
}

impl DescribeTableTool {
    pub fn new(db: Arc<SqliteDatabase>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl Tool for DescribeTableTool {
    fn name(&self) -> String {
        "describe_table".to_string()
    }

    fn description(&self) -> String {
        "Get the schema information for a specific table".to_string()
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "table_name": {
                    "type": "string",
                    "description": "Name of the table to describe"
                }
            },
            "required": ["table_name"]
        })
    }

    async fn call(&self, input: Option<Value>) -> Result<Vec<Content>> {
        let params = match input {
            Some(value) => serde_json::from_value::<TableNameParams>(value)?,
            None => return Err(anyhow::anyhow!("Missing table_name parameter")),
        };

        debug!(
            "DescribeTableTool called with table_name: {}",
            params.table_name
        );

        match self.db.describe_table(&params.table_name).await {
            Ok(result) => {
                debug!("Table description retrieved successfully");
                Ok(vec![Content::Text {
                    text: serde_json::to_string_pretty(&result)?,
                }])
            }
            Err(e) => {
                error!("Error describing table: {}", e);
                Err(anyhow::anyhow!("Error describing table: {}", e))
            }
        }
    }
}
