async function refinerAgent(previousContext) {
    const response = await fetch("http://localhost:4000/mcp/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            agentId: "RefinerAgent",
            context: {
                input: `Please refine the following summary: ${previousContext.response}`,
            },
        }),
    });

    const result = await response.json();
    return result.updatedContext;
}

module.exports = refinerAgent;
