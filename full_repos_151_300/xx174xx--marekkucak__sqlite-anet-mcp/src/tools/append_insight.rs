use anet_mcp_server::{Content, Tool};
use anyhow::Result;
use async_trait::async_trait;
use serde_json::{json, Value};
use tracing::{debug, error};

use crate::models::sqlite::InsightParams;
use crate::sqlite::SqliteDatabase;
use std::sync::Arc;

pub struct AppendInsightTool {
    db: Arc<SqliteDatabase>,
}

impl AppendInsightTool {
    pub fn new(db: Arc<SqliteDatabase>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl Tool for AppendInsightTool {
    fn name(&self) -> String {
        "append_insight".to_string()
    }

    fn description(&self) -> String {
        "Add a business insight to the memo".to_string()
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "insight": {
                    "type": "string",
                    "description": "Business insight discovered from data analysis"
                }
            },
            "required": ["insight"]
        })
    }

    async fn call(&self, input: Option<Value>) -> Result<Vec<Content>> {
        let params = match input {
            Some(value) => serde_json::from_value::<InsightParams>(value)?,
            None => return Err(anyhow::anyhow!("Missing insight parameter")),
        };

        debug!("AppendInsightTool called with insight: {}", params.insight);

        match self.db.add_insight(&params.insight).await {
            Ok(_) => {
                debug!("Insight added successfully");
                Ok(vec![Content::Text { 
                    text: "Insight added to memo".to_string() 
                }])
            }
            Err(e) => {
                error!("Error adding insight: {}", e);
                Err(anyhow::anyhow!("Error adding insight: {}", e))
            }
        }
    }
}
