
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

const initializeGemini = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
};

export const generatePoeticSummary = async (title, date, description) => {
    try {
        if (!genAI) {
            initializeGemini();
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `You are writing a deeply personal poetic memory.

Event Title: ${title}
Date: ${date}
Memory Description: ${description}

Write a 2-line romantic Shayari (poetic couplet) in English.

Guidelines:
Guidelines:
- Strictly 2 short lines only.
- Make it sweet, cute, and heartwarming.
- Focus on the 'aww' feeling.
- Keep it simple and adorable.
- No complex metaphors, just pure love.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text.trim();
    } catch (error) {
        console.error("Gemini AI Generation Error:", error);
        throw error;
    }
};

export const generateLoveLetter = async (data) => {
    try {
        if (!genAI) {
            initializeGemini();
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `Write a 200-word heartfelt romantic letter.

Details:
Her Name: ${data.partnerName}
How We Met: ${data.howWeMet}
Favorite Memory: ${data.favoriteMemory}
What I Admire Most: ${data.admire}
Inside Joke: ${data.insideJoke}

Instructions:
- Make it deeply personal
- Emotionally mature
- Avoid generic romantic clichés
- No overdramatic exaggeration
- Feel authentic and human
- Use vivid but subtle imagery
- Write in natural paragraph format
- Do NOT sound like an AI
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text.trim();
    } catch (error) {
        console.error("Gemini Love Letter Generation Error:", error);
        throw error;
    }
};
export const generateFutureReflection = async (partnerName) => {
    try {
        if (!genAI) {
            initializeGemini();
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Write a short reflection from a man 10 years after his partner (${partnerName}) said yes to him.
Tone:
- Soft
- Mature
- Grateful
- Real and grounded
Avoid clichés.
Include subtle everyday details.
Make it feel emotionally authentic.
Length: 3-4 sentences maximum.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text.trim();
    } catch (error) {
        console.error("Gemini Future Reflection Generation Error:", error);
        // Fallback text if generic error
        return "It's been ten years, and my favorite sound is still your laughter echoing in our kitchen. Every morning coffee, every quiet evening, just confirms that saying yes to you was the start of my best life.";
    }
};
