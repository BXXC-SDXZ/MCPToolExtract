use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct TableInfo {
    pub cid: i64,
    pub name: String,
    pub type_name: String,
    pub notnull: i64,
    pub dflt_value: Option<String>,
    pub pk: i64,
}

#[derive(Debug, Serialize)]
pub struct AffectedRows {
    pub affected_rows: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTableParams {
    pub query: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TableNameParams {
    pub table_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryParams {
    pub query: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InsightParams {
    pub insight: String,
}


