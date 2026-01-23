import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I am JARVIS, your project assistant. Ask me anything about this Soil Analysis project!' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(null);

    useEffect(() => {
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.lang = 'en-US';

            recognition.current.onstart = () => setIsListening(true);
            recognition.current.onend = () => setIsListening(false);
            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript);
            };
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleListening = () => {
        if (isListening) {
            recognition.current?.stop();
        } else {
            recognition.current?.start();
        }
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async (textOverride = null) => {
        const text = textOverride || input;
        if (!text.trim()) return;

        // Add user message
        const newMessages = [...messages, { role: 'user', text }];
        setMessages(newMessages);
        setInput('');

        // System Context
        const systemPrompt = `You are JARVIS, the advanced AI assistant for the "Sand Grain Mapper" project created by Hari.
    
    Current Goal: Provide a comprehensive "Top to Bottom" explanation of the project if asked, covering the Problem, Solution, Tech Stack, and Features.

    Project Knowledge Base:
    1. **Overview**: This is a Geological Analysis Tool designed to modernize soil testing, which is traditionally slow and manual.
    2. **Core Feature**: Users can upload or capture images of soil/sand. The system uses Computer Vision (Gemini 1.5 Flash) to analyze the image content.
    3. **Outputs**:
       - **Grain Size Analysis**: Calculates statistical distribution of grain sizes (micrometers).
       - **Soil Identification**: Classifies soil (e.g., Red Soil, Alluvial, Desert Sand) and its properties.
       - **Location Mapping**: Estimates the likely geographical origin based on visual markers and shows it on an interactive Map (Leaflet).
    4. **Tech Stack**:
       - **Frontend**: React.js for a responsive UI.
       - **Backend**: Node.js & Express server handling API requests.
       - **AI**: Google Gemini API for both Vision (image analysis) and Chat (this assistant).
       - **Visualization**: Chart.js for graphs and Leaflet for maps.
    5. **Reporting**: Generates professional PDF reports including the map and analysis for download.

    Instructions:
    - If the user asks "Explain this project", give a structured, detailed response covering all the points above.
    - Be helpful, professional, and enthusiastic.
    
    User Question: ${text}`;

        try {
            const res = await axios.post('/api/gemini', {
                prompt: systemPrompt
            });

            const botResponse = res.data.output || "I'm sorry, I couldn't process that.";
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
            speak(botResponse);
        } catch (err) {
            console.error(err);
            const errorMsg = "Sorry, I'm having trouble connecting to the server.";
            setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
            speak(errorMsg);
        }
    };

    return (
        <div className="voice-assistant-container">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        <div className="chat-header">
                            <h3>JARVIS Assistant</h3>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.role}`}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-area">
                            <button
                                className={`mic-btn ${isListening ? 'listening' : ''}`}
                                onClick={toggleListening}
                                title="Speak"
                            >
                                {isListening ? '🎤' : '🎙️'}
                            </button>
                            <input
                                type="text"
                                className="chat-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about the project..."
                            />
                            <button className="send-btn" onClick={() => handleSend()}>➤</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button className="voice-fab" onClick={() => setIsOpen(!isOpen)}>
                <span className="fab-icon">🤖</span>
            </button>
        </div>
    );
};

export default VoiceAssistant;
