const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function findWorkingModel() {
    console.log("Fetching available models...");
    try {
        // 1. Get List
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const listRes = await axios.get(listUrl);

        const candidates = listRes.data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace('models/', ''));

        console.log("Candidates found:", candidates.length);
        console.log(candidates.join(', '));

        // 2. Test Candidates
        for (const model of candidates) {
            console.log(`Testing ${model}...`);
            try {
                const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
                await axios.post(genUrl, {
                    contents: [{ parts: [{ text: "ping" }] }]
                });

                console.log(`[SUCCESS] Found working model: ${model}`);

                // 3. Write result to file for the agent to read
                fs.writeFileSync('working_model.txt', model);
                return;
            } catch (err) {
                console.log(`[FAIL] ${model} - ${err.message}`);
            }
        }
        console.log("No working models found.");
    } catch (err) {
        console.error("Error listing models:", err.message);
    }
}

findWorkingModel();
