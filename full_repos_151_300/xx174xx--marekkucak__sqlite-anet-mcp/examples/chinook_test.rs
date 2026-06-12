/*
 * Chinook Database Test Client for SQLite MCP Server
 * 
 * This example demonstrates using the SQLite MCP server with the Chinook database,
 * which is a sample SQLite database representing a digital music store.
 * 
 * Setup Instructions:
 * 1. Download the Chinook database from: https://www.sqlitetutorial.net/sqlite-sample-database/
 *    Direct download link: https://www.sqlitetutorial.net/wp-content/uploads/2018/03/chinook.zip
 * 
 * 2. Extract the zip file - the database file should be named "chinook.db"
 *    (Note: The actual filename may be different from what some documentation calls it)
 * 
 * 3. Place the chinook.db file in your project's root directory
 * 
 * 4. IMPORTANT: Make sure you're using the correct filename in your environment variable:
 *    export SQLITE_DB_PATH=./chinook.db
 *    
 *    (If you're encountering "no such table" errors, double-check that the filename
 *     matches exactly what was extracted from the zip file - SQLite filenames are
 *     case-sensitive and the file must exist exactly at the path specified)
 * 
 * 5. Stop any currently running instances of the MCP server
 * 
 * 6. Start the MCP server in one terminal:
 *    cargo run
 * 
 * 7. Run this test client in another terminal:
 *    cargo run --example chinook_test
 * 
 * Troubleshooting:
 * - If you see "no such table: Artist" or similar errors in the logs, the database
 *   file isn't being loaded correctly.
 * - Run: ls -la to verify the database file exists exactly where you think it does
 * - Try opening the database directly with the sqlite3 command line tool to verify
 *   it's not corrupted: sqlite3 chinook.db ".tables"
 */

use anyhow::{Context, Result};
use async_nats::{Client, ConnectOptions};
use futures_util::StreamExt;
use serde_json::{json, Value};

#[tokio::main]
async fn main() -> Result<()> {
    println!("Connecting to NATS server...");
    let client = async_nats::connect_with_options(
        "nats://localhost:4222",
        ConnectOptions::new().retry_on_initial_connect(),
    )
    .await
    .context("Failed to connect to NATS")?;

    println!("Connected to NATS server");

    async fn send_request(client: &Client, method: &str, params: Value, id: &str) -> Result<Value> {
        let request = json!({
            "jsonrpc": "2.0",
            "id": id,
            "method": method,
            "params": params
        });

        println!("Sending request: {}", serde_json::to_string_pretty(&request)?);

        let inbox = client.new_inbox();
        let mut sub = client.subscribe(inbox.clone()).await?;

        client
            .publish_with_reply(
                "mcp.requests".to_string(),
                inbox,
                serde_json::to_vec(&request)?.into(),
            )
            .await?;

        let msg = sub
            .next()
            .await
            .ok_or_else(|| anyhow::anyhow!("No response"))?;
        serde_json::from_slice(&msg.payload).context("Failed to parse response")
    }

    println!("\n===== Listing all tables in Chinook database =====");
    let list_tables_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "list_tables",
            "arguments": {}
        }),
        "list-tables",
    )
    .await?;
    println!(
        "Tables in Chinook database: {}",
        serde_json::to_string_pretty(&list_tables_response["result"]["content"][0]["text"])?
    );

    println!("\n===== Exploring Artists table schema =====");
    let describe_artist_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "describe_table",
            "arguments": {
                "table_name": "artists"
            }
        }),
        "describe-artist",
    )
    .await?;
    println!(
        "Artists table schema: {}",
        serde_json::to_string_pretty(&describe_artist_response["result"]["content"][0]["text"])?
    );

    println!("\n===== Counting total artists =====");
    let count_artists_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "read_query",
            "arguments": {
                "query": "SELECT COUNT(*) AS artistcount FROM artists"
            }
        }),
        "count-artists",
    )
    .await?;
    println!(
        "Artist count: {}",
        serde_json::to_string_pretty(&count_artists_response["result"]["content"][0]["text"])?
    );

    println!("\n===== Finding top 5 artists with most albums =====");
    let top_artists_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "read_query",
            "arguments": {
                "query": "SELECT artists.name, COUNT(albums.albumid) AS albumcount 
                          FROM artists 
                          JOIN albums ON artists.artistid = albums.artistid 
                          GROUP BY artists.artistid 
                          ORDER BY albumcount DESC 
                          LIMIT 5"
            }
        }),
        "top-artists",
    )
    .await?;
    println!(
        "Top 5 artists by album count: {}",
        serde_json::to_string_pretty(&top_artists_response["result"]["content"][0]["text"])?
    );

    println!("\n===== Finding total sales by country =====");
    let sales_by_country_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "read_query",
            "arguments": {
                "query": "SELECT billingcountry, SUM(total) AS totalsales 
                          FROM invoices 
                          GROUP BY billingcountry 
                          ORDER BY totalsales DESC"
            }
        }),
        "sales-by-country",
    )
    .await?;
    println!(
        "Sales by country: {}",
        serde_json::to_string_pretty(&sales_by_country_response["result"]["content"][0]["text"])?
    );

    println!("\n===== Saving an insight about the Chinook database =====");
    let append_insight_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "append_insight",
            "arguments": {
                "insight": "The Chinook database shows Iron Maiden has the highest number of albums in the collection."
            }
        }),
        "append-insight",
    )
    .await?;
    println!(
        "Insight saved: {}",
        serde_json::to_string_pretty(&append_insight_response["result"]["content"][0]["text"])?
    );

    Ok(())
}
