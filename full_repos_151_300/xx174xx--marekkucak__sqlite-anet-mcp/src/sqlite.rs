use anyhow::Result;
use rusqlite::{Connection, Row};
use serde_json::{Map, Value};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tokio::task;
use tracing::info;

use crate::models::sqlite::{AffectedRows, TableInfo};

// This struct will be wrapped in an Arc when created
#[derive(Clone)]
pub struct SqliteDatabase {
    inner: Arc<SqliteDatabaseInner>,
}

// Inner struct with the actual data
struct SqliteDatabaseInner {
    db_path: PathBuf,
    conn: Mutex<Connection>,
    insights: Mutex<Vec<String>>,
}

impl SqliteDatabase {
    pub fn new<P: AsRef<Path>>(db_path: P) -> Result<Arc<Self>> {
        let db_path = db_path.as_ref().to_path_buf();
        
        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        
        info!("Opening SQLite database at: {:?}", db_path);
        let conn = Connection::open(&db_path)?;
        
        let inner = Arc::new(SqliteDatabaseInner {
            db_path,
            conn: Mutex::new(conn),
            insights: Mutex::new(Vec::new()),
        });
        
        Ok(Arc::new(Self { inner }))
    }
    
    pub async fn execute_query(&self, query: &str, params: Option<Map<String, Value>>) -> Result<Vec<Value>> {
        let query = query.to_string();
        let inner = self.inner.clone();
        
        // Execute in a blocking task since rusqlite is not async
        task::spawn_blocking(move || {
            let conn_guard = match inner.conn.lock() {
                Ok(guard) => guard,
                Err(e) => return Err(anyhow::anyhow!("Mutex lock error: {}", e))
            };
            
            let query_upper = query.trim().to_uppercase();
            let is_write = query_upper.starts_with("INSERT") || 
                           query_upper.starts_with("UPDATE") || 
                           query_upper.starts_with("DELETE") || 
                           query_upper.starts_with("CREATE") || 
                           query_upper.starts_with("DROP") || 
                           query_upper.starts_with("ALTER");
            
            if is_write {
                // For write operations
                let mut stmt = conn_guard.prepare(&query)?;
                
                // Handle parameters if provided, simplified implementation
                let affected_rows = stmt.execute([])?;
                
                Ok(vec![serde_json::to_value(AffectedRows { affected_rows: affected_rows as i64 })?])
            } else {
                // For read operations
                let mut stmt = conn_guard.prepare(&query)?;
                
                // Convert column names to Vec<String>
                let column_names: Vec<String> = stmt
                    .column_names()
                    .into_iter()
                    .map(String::from)
                    .collect();
                
                // Execute query - simplified to not use params for now
                let rows = stmt.query_map([], |row| {
                    row_to_json(row, &column_names)
                })?;
                
                // Collect results
                let mut results = Vec::new();
                for row_result in rows {
                    let row_value = row_result?;
                    results.push(row_value);
                }
                
                Ok(results)
            }
        }).await?
    }
    
    pub async fn list_tables(&self) -> Result<Vec<String>> {
        let inner = self.inner.clone();
        
        task::spawn_blocking(move || {
            let conn_guard = match inner.conn.lock() {
                Ok(guard) => guard,
                Err(e) => return Err(anyhow::anyhow!("Mutex lock error: {}", e))
            };
            
            let mut stmt = conn_guard.prepare("SELECT name FROM sqlite_master WHERE type='table'")?;
            let rows = stmt.query_map([], |row| row.get::<_, String>(0))?;
            
            let mut tables = Vec::new();
            for table_result in rows {
                tables.push(table_result?);
            }
            
            Ok(tables)
        }).await?
    }
    
    pub async fn describe_table(&self, table_name: &str) -> Result<Vec<TableInfo>> {
        let table_name = table_name.to_string();
        let inner = self.inner.clone();
        
        task::spawn_blocking(move || {
            let conn_guard = match inner.conn.lock() {
                Ok(guard) => guard,
                Err(e) => return Err(anyhow::anyhow!("Mutex lock error: {}", e))
            };
            
            let query = format!("PRAGMA table_info({})", table_name);
            let mut stmt = conn_guard.prepare(&query)?;
            
            let rows = stmt.query_map([], |row| {
                Ok(TableInfo {
                    cid: row.get(0)?,
                    name: row.get(1)?,
                    type_name: row.get(2)?,
                    notnull: row.get(3)?,
                    dflt_value: row.get(4)?,
                    pk: row.get(5)?,
                })
            })?;
            
            let mut columns = Vec::new();
            for column_result in rows {
                columns.push(column_result?);
            }
            
            Ok(columns)
        }).await?
    }
    
    pub async fn add_insight(&self, insight: &str) -> Result<()> {
        let insight = insight.to_string();
        let inner = self.inner.clone();
        
        task::spawn_blocking(move || {
            let mut insights = match inner.insights.lock() {
                Ok(guard) => guard,
                Err(e) => return Err(anyhow::anyhow!("Mutex lock error: {}", e))
            };
            insights.push(insight);
            Ok(())
        }).await?
    }
    
    pub async fn synthesize_memo(&self) -> Result<String> {
        let inner = self.inner.clone();
        
        task::spawn_blocking(move || {
            let insights = match inner.insights.lock() {
                Ok(guard) => guard,
                Err(e) => return Err(anyhow::anyhow!("Mutex lock error: {}", e))
            };
            
            if insights.is_empty() {
                return Ok("No business insights have been discovered yet.".to_string());
            }
            
            let insights_text = insights
                .iter()
                .map(|insight| format!("- {}", insight))
                .collect::<Vec<_>>()
                .join("\n");
            
            let mut memo = "📊 Business Intelligence Memo 📊\n\n".to_string();
            memo.push_str("Key Insights Discovered:\n\n");
            memo.push_str(&insights_text);
            
            if insights.len() > 1 {
                memo.push_str("\n\nSummary:\n");
                memo.push_str(&format!(
                    "Analysis has revealed {} key business insights that suggest opportunities for strategic optimization and growth.",
                    insights.len()
                ));
            }
            
            Ok(memo)
        }).await?
    }
}

// Standalone function to convert a row to JSON
fn row_to_json(row: &Row, column_names: &[String]) -> Result<Value, rusqlite::Error> {
    let mut map = Map::new();
    
    for (i, name) in column_names.iter().enumerate() {
        let value = match row.get_ref(i)? {
            rusqlite::types::ValueRef::Null => Value::Null,
            rusqlite::types::ValueRef::Integer(i) => Value::Number(i.into()),
            rusqlite::types::ValueRef::Real(f) => {
                // Convert f64 to serde_json::Number
                if let Some(num) = serde_json::Number::from_f64(f) {
                    Value::Number(num)
                } else {
                    Value::Null
                }
            },
            rusqlite::types::ValueRef::Text(t) => Value::String(String::from_utf8_lossy(t).to_string()),
            rusqlite::types::ValueRef::Blob(b) => Value::String(format!("BLOB: {} bytes", b.len())),
        };
        
        map.insert(name.clone(), value);
    }
    
    Ok(Value::Object(map))
}
