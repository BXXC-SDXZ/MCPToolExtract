use anet_mcp_server::Resource;
use anyhow::Result;
use tracing::debug;

use crate::sqlite::SqliteDatabase;
use std::sync::Arc;

#[derive(Clone)]
pub struct MemoResource {
    db: Arc<SqliteDatabase>,
}

impl MemoResource {
    pub fn new(db: Arc<SqliteDatabase>) -> Self {
        Self { db }
    }

    pub fn get_resource(&self) -> Resource {
        Resource {
            uri: "memo://insights".to_string(),
            name: "Business Insights Memo".to_string(),
            description: "A living document of discovered business insights".to_string(),
            mime_type: "text/plain".to_string(),
        }
    }

    pub async fn read_resource(&self, uri: &str) -> Result<String> {
        debug!("Reading resource: {}", uri);
        
        if uri != "memo://insights" {
            return Err(anyhow::anyhow!("Unknown resource URI: {}", uri));
        }
        
        Ok(self.db.synthesize_memo().await?)
    }
}
