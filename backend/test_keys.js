const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
console.log("Testing API Key:", API_KEY ? "Present" : "Missing");

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const response = await axios.get(url);
        console.log("Available Models:");
        response.data.models.forEach(m => console.log(`- ${m.name}`));
    } catch (error) {
        console.log(`[FAIL] List Models: ${error.response ? error.response.status : error.message}`);
        if (error.response) console.log(JSON.stringify(error.response.data, null, 2));
    }
}

listModels();
