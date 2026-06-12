require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const PORT = 4000;
app.use(cors());
app.use(bodyParser.json());

// Use OpenRouter endpoint
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

app.post("/mcp/context", async (req, res) => {
    const { agentId, context } = req.body;

    try {
        const gptResponse = await openai.chat.completions.create({
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: context.input },
            ],
        });

        const reply = gptResponse.choices[0].message.content;

        const updatedContext = {
            ...context,
            response: reply,
            processedBy: agentId,
            timestamp: new Date().toISOString(),
        };

        res.json({ success: true, updatedContext });
    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(
        `🚀 MCP Server using Mixtral is running at http://localhost:${PORT}`
    );
});
