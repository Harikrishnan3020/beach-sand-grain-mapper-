const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const candidates = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro',
    'gemini-1.5-pro-001',
    'gemini-1.5-pro-002',
    'gemini-pro',
    'gemini-1.0-pro',
    'gemini-2.0-flash-exp' // seen in logs
];

async function check(model) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        await axios.post(url, { contents: [{ parts: [{ text: "hi" }] }] });
        console.log(`[SUCCESS] ${model}`);
        return model;
    } catch (e) {
        // console.log(`[FAIL] ${model} ${e.response?.status}`);
        return null;
    }
}

async function run() {
    console.log("Searching for working model...");
    for (const m of candidates) {
        const res = await check(m);
        if (res) {
            console.log("FOUND_MODEL: " + res);
            process.exit(0);
        }
    }
    console.log("NO_MODEL_FOUND");
}

run();
