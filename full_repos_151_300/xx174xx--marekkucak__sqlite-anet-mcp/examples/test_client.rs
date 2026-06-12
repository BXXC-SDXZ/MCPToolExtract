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

    // Test 1: Initialize
    println!("\nTesting initialize...");
    let init_response = send_request(
        &client,
        "initialize",
        json!({"clientInfo": {"name": "sqlite-test-client"}}),
        "1",
    )
    .await?;
    println!(
        "Initialize response: {}",
        serde_json::to_string_pretty(&init_response)?
    );

    // Test 2: List Tools
    println!("\nTesting listTools...");
    let tools_response = send_request(&client, "listTools", json!({}), "2").await?;
    println!(
        "ListTools response: {}",
        serde_json::to_string_pretty(&tools_response)?
    );

    // Test 3: List Prompts
    println!("\nTesting listPrompts...");
    let prompts_response = send_request(&client, "listPrompts", json!({}), "3").await?;
    println!(
        "ListPrompts response: {}",
        serde_json::to_string_pretty(&prompts_response)?
    );

    // Test 4: Get Prompt
    println!("\nTesting getPrompt...");
    let prompt_response = send_request(
        &client,
        "getPrompt",
        json!({
            "name": "mcp-demo",
            "arguments": {
                "topic": "coffee shop sales"
            }
        }),
        "4",
    )
    .await?;
    println!(
        "GetPrompt response: {}",
        serde_json::to_string_pretty(&prompt_response)?
    );

    // Test 5: List Resources
    println!("\nTesting listResources...");
    let resources_response = send_request(&client, "listResources", json!({}), "5").await?;
    println!(
        "ListResources response: {}",
        serde_json::to_string_pretty(&resources_response)?
    );

    // Test 6: Create Table
    println!("\nTesting callTool with create_table...");
    let create_table_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "create_table",
            "arguments": {
                "query": "CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, join_date TEXT)"
            }
        }),
        "6",
    )
    .await?;
    println!(
        "Create table response: {}",
        serde_json::to_string_pretty(&create_table_response)?
    );

    // Test 7: List Tables
    println!("\nTesting callTool with list_tables...");
    let list_tables_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "list_tables",
            "arguments": {}
        }),
        "7",
    )
    .await?;
    println!(
        "List tables response: {}",
        serde_json::to_string_pretty(&list_tables_response)?
    );

    // Test 8: Write Query (INSERT)
    println!("\nTesting callTool with write_query (INSERT)...");
    let insert_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "write_query",
            "arguments": {
                "query": "INSERT INTO customers (name, email, join_date) VALUES ('John Doe', 'john@example.com', '2023-01-15')"
            }
        }),
        "8",
    )
    .await?;
    println!(
        "Insert response: {}",
        serde_json::to_string_pretty(&insert_response)?
    );

    // Test 9: Read Query (SELECT)
    println!("\nTesting callTool with read_query (SELECT)...");
    let select_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "read_query",
            "arguments": {
                "query": "SELECT * FROM customers"
            }
        }),
        "9",
    )
    .await?;
    println!(
        "Select response: {}",
        serde_json::to_string_pretty(&select_response)?
    );

    // Test 10: Describe Table
    println!("\nTesting callTool with describe_table...");
    let describe_table_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "describe_table",
            "arguments": {
                "table_name": "customers"
            }
        }),
        "10",
    )
    .await?;
    println!(
        "Describe table response: {}",
        serde_json::to_string_pretty(&describe_table_response)?
    );

    // Test 11: Append Insight
    println!("\nTesting callTool with append_insight...");
    let append_insight_response = send_request(
        &client,
        "callTool",
        json!({
            "name": "append_insight",
            "arguments": {
                "insight": "Customer acquisition is stable and growing over time."
            }
        }),
        "11",
    )
    .await?;
    println!(
        "Append insight response: {}",
        serde_json::to_string_pretty(&append_insight_response)?
    );

    // Test 12: Read Resource
    println!("\nTesting readResource...");
    let read_resource_response = send_request(
        &client,
        "readResource",
        json!({
            "uri": "memo://insights"
        }),
        "12",
    )
    .await?;
    println!(
        "Read resource response: {}",
        serde_json::to_string_pretty(&read_resource_response)?
    );

    Ok(())
}
