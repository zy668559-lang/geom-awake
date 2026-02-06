import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // The SDK doesn't have a direct listModels, we use the REST API via fetch
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await resp.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
