# Getting Started with eSignatures NDA

## Server Verification
```javascript
const response = await createContract({
  test: "yes",
  title: "Test Contract",
  mcp_query: "test",
  contract_source: "mcpserver",
  document_elements: [{
    text: "Test contract",
    type: "text_normal"
  }]
});
```

## Basic Requirements
1. MCP Server access credentials
2. Understanding of contract elements
3. Knowledge of digital signature requirements

## Initial Setup
1. Server connection testing
2. Template creation
3. Signature workflow setup

## Best Practices
- Always use test mode for development
- Verify signature capabilities
- Check contract status after creation