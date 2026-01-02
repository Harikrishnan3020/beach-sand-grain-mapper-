const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
console.log("Testing API Key:", API_KEY ? "Present" : "Missing");

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const response = await axios.get(url);
        const fs = require('fs');
        const models = response.data.models.map(m => m.name).join('\n');
        console.log("Available Models:");
        console.log(models);
        fs.writeFileSync('models_list.txt', models);
    } catch (error) {
        console.log(`[FAIL] List Models: ${error.response ? error.response.status : error.message}`);
        if (error.response) console.log(JSON.stringify(error.response.data, null, 2));
    }
}

listModels();
