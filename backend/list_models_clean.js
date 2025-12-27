const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("Checking models for key ending in: " + (API_KEY ? API_KEY.slice(-4) : "None"));
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        console.log("--- START MODEL LIST ---");
        response.data.models.forEach(m => {
            if (m.name.includes("gemini")) {
                console.log(m.name.replace("models/", ""));
            }
        });
        console.log("--- END MODEL LIST ---");
    } catch (error) {
        console.error("Error listing models:", error.response ? error.response.status : error.message);
    }
}

listModels();
