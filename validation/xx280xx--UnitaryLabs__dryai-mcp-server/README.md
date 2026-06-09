# dryai-mcp-server

The [Dry.ai](https://dry.ai) Model Context Protocol (MCP) server enables seamless integration between Claude and your Dry smartspaces, turning conversations into persistent, structured data. Currently, you can use this server to create and store memories and query the information in your database (smartspace).

Begin by signing up for our alpha [here](https://dry.ai/getClaudeMemory)

Watch a video of Dry in action [here](https://youtu.be/TW55riZYsZo?si=pgbnrMACYSxk321Q)


## Steps to Configure your User

1. Log in to [Dry.ai](https://dry.ai) and navigate to your **Dry Profile**.
<img width="611" alt="Screenshot 2025-04-11 at 12 15 17 PM" src="https://github.com/user-attachments/assets/462d5e88-97f0-4f87-8e64-1e75c07bb8a8" />


2. Generate an **MCP Token** from your profile. Make note of this token, as you will use it later. Select smartspacess that you are a member of
    which have been configured for MCP access. See 
   
<img width="889" alt="image" src="https://github.com/user-attachments/assets/5ecc2bde-61e6-491b-8858-ce2f5e8a8eb8" />

## Steps to Configure a Smartspace for MCP

1. Open the settings for the smartspace that you want to connect. Click the "Chat" tab and show More Options
<img width="1029" alt="image" src="https://github.com/user-attachments/assets/dfa4c2c0-d1ac-495f-b2a0-50995b3c2df7" />

2. Click the toggle to enable MCP on the smartspace and provide a description that will let Claude know when you want to send questions to this smartspace.

## Steps to connect Dry to Claude Desktop

1. Install Node.js (v18.x or later)
   Download from: https://nodejs.org/
   Verify installation by opening Command Prompt (CMD) and running:
   ```node --version```

2. Modify your `claude_desktop_config.json` file to include the following configuration:
 ```json
   {
      "mcpServers": {
        "dryai": {
         "command": "npx",
         "args": ["-y", "@jrscally/dryai-mcp-server"],
         "env": {
            "MCP_TOKEN": "<MCP TOKEN>"
         }
      }
      }
   }
   ```
You can access this by visiting Claude->Settings->Developer and pressing "Edit Config" 

2. Run Claude Desktop - it will connect to Dry and all of your configured smartspaces will appear as tools to ask questions and add items. Every time you create or install new memory types in your Dry space, you'll need to restart your Claude desktop app to sync its tools with the latest state of your Dry smartspace.

