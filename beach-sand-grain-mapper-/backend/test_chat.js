const axios = require('axios');

async function testChat() {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/gemini', {
            prompt: "Hello Jarvis, are you working?"
        });
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Data:", error.response.data);
        }
    }
}

testChat();
