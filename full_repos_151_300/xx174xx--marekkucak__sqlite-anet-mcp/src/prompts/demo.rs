use anet_mcp_server::{Prompt, PromptArgument};
use anyhow::Result;
use tracing::debug;
use serde_json::Map;

#[derive(Clone)]
pub struct DemoPrompt;

impl DemoPrompt {
    pub fn new() -> Self {
        Self
    }

    pub fn get_prompt(&self) -> Prompt {
        Prompt {
            name: "mcp-demo".to_string(),
            description: "A prompt to seed the database with initial data and demonstrate what you can do with an SQLite MCP Server + Claude".to_string(),
            arguments: vec![
                PromptArgument {
                    name: "topic".to_string(),
                    description: "Topic to seed the database with initial data".to_string(),
                    required: true,
                }
            ],
        }
    }

    pub async fn generate_prompt(&self, args: &Map<String, serde_json::Value>) -> Result<serde_json::Value> {
        debug!("Generating prompt with args: {:?}", args);
        
        let topic = match args.get("topic") {
            Some(value) => value.as_str().ok_or_else(|| anyhow::anyhow!("topic must be a string"))?,
            None => return Err(anyhow::anyhow!("Missing required argument: topic")),
        };

        // Instead of using include_str!, let's hardcode the prompt template
        let prompt_template = "The assistants goal is to walkthrough an informative demo of MCP. To demonstrate the Model Context Protocol (MCP) we will leverage this example server to interact with an SQLite database.\nIt is important that you first explain to the user what is going on. The user has downloaded and installed the SQLite MCP Server and is now ready to use it.\nThey have selected the MCP menu item which is contained within a parent menu denoted by the paperclip icon. Inside this menu they selected an icon that illustrates two electrical plugs connecting. This is the MCP menu.\nBased on what MCP servers the user has installed they can click the button which reads: 'Choose an integration' this will present a drop down with Prompts and Resources. The user has selected the prompt titled: 'mcp-demo'.\nThis text file is that prompt. The goal of the following instructions is to walk the user through the process of using the 3 core aspects of an MCP server. These are: Prompts, Tools, and Resources.\nThey have already used a prompt and provided a topic. The topic is: {topic}. The user is now ready to begin the demo.";
        let prompt = prompt_template.replace("{topic}", topic);

        Ok(serde_json::json!({
            "description": format!("Demo template for {}", topic),
            "messages": [{
                "role": "user",
                "content": {
                    "type": "text",
                    "text": prompt.trim()
                }
            }]
        }))
    }
}
