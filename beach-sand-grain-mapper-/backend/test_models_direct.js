const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testModel(modelName, retries = 3) {
    console.log(`Testing ${modelName}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Hello" }] }]
        });
        console.log(`[SUCCESS] ${modelName}:`, response.data.candidates[0].content.parts[0].text.trim());
        return true;
    } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.log(`[RETRY] ${modelName}: 429 Rate Limit. Retrying in 5s...`);
            await new Promise(res => setTimeout(res, 5000));
            return testModel(modelName, retries - 1);
        }
        console.log(`[FAIL] ${modelName}: ${error.response ? error.response.status : error.message}`);
        return false;
    }
}

async function runTests() {
    const models = [
        'gemini-flash-latest',
        'gemini-2.0-flash',
        'gemini-2.5-flash',
        'gemini-pro-latest'
    ];

    for (const m of models) {
        await testModel(m);
    }
}

runTests();
