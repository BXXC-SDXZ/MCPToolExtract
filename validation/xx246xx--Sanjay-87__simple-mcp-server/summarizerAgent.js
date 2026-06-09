async function summarizerAgent(input) {
    const response = await fetch("http://localhost:4000/mcp/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            agentId: "SummarizerAgent",
            context: { input, task: 'explain' },
        }),
    });

    const result = await response.json();
    return result.updatedContext;
}

module.exports = summarizerAgent;
