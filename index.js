require("dotenv").config();

const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const jokes = [
    "Why don’t skeletons fight each other? They don’t have the guts.",
    "Why was the math book sad? Because it had too many problems.",
    "Why did the computer go to therapy? Too many bytes of trauma.",
    "I told my AI a joke… now it thinks it’s a comedian."
];

async function searchWeb(query) {
    try {
        // Simple DuckDuckGo instant answer API
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
        const response = await axios.get(url);

        if (response.data.AbstractText) {
            return response.data.AbstractText;
        }

        return `I searched for "${query}" but found limited direct info.`;
    } catch (err) {
        return "Search failed.";
    }
}

app.get("/", (req, res) => {
    res.send("zer0 AI Assistant is online.");
});

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({
            reply: "Please send a message."
        });
    }

    const lower = userMessage.toLowerCase();

    // Joke command
    if (lower.includes("joke")) {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        return res.json({
            reply: `zer0 says: ${joke}`
        });
    }

    // Search command
    if (lower.startsWith("search ")) {
        const query = userMessage.replace("search ", "");
        const result = await searchWeb(query);

        return res.json({
            reply: `zer0 found: ${result}`
        });
    }

    // Fun command
    if (lower.includes("play")) {
        return res.json({
            reply: "zer0 is always ready to play. Try: joke, search cats, tell me something cool."
        });
    }

    // General AI reply
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
You are zer0, a smart AI assistant.
You are funny, helpful, playful, informative, and confident.
You help users with info, jokes, fun, and useful answers.
Stay safe and avoid harmful or illegal requests.
`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ]
        });

        const reply = completion.choices[0].message.content;

        res.json({
            reply: `zer0: ${reply}`
        });

    } catch (error) {
        res.status(500).json({
            reply: "zer0 had a brain lag. Try again."
        });
    }
});

app.listen(PORT, () => {
    console.log(`zer0 running on port ${PORT}`);
});
