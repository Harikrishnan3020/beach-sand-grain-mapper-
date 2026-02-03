const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'data.json');

// --- Persistence Helpers ---
function loadData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { users: [], activities: [], queries: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial));
      return initial;
    }
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    // Ensure queries array exists
    if (!data.queries) data.queries = [];
    return data;
  } catch (err) {
    console.error("Error loading data:", err);
    return { users: [], activities: [], queries: [] };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving data:", err);
  }
}

// --- Admin / User Tracking Endpoints ---

// POST /api/login - Record login or return admin status
app.post('/api/login', (req, res) => {
  const { email, password, name, picture } = req.body;

  // Admin Check
  if (email === 'admin1' && password === 'admin1') {
    return res.json({
      user: {
        id: 'admin_001',
        name: 'Administrator',
        email: 'admin1',
        role: 'Admin',
        status: 'Active'
      }
    });
  }

  // Normal User Login Logging
  const db = loadData();
  const existingUserIndex = db.users.findIndex(u => u.email === email);

  const userInfo = {
    email: email,
    name: name || email.split('@')[0],
    picture: picture || 'https://via.placeholder.com/40',
    lastLogin: new Date().toISOString(),
    role: 'User',
    status: 'Active'
  };

  if (existingUserIndex >= 0) {
    db.users[existingUserIndex] = { ...db.users[existingUserIndex], ...userInfo };
  } else {
    db.users.push({ ...userInfo, id: Date.now(), analyses: 0 });
  }

  saveData(db);

  // Return the user object
  const savedUser = existingUserIndex >= 0 ? db.users[existingUserIndex] : db.users[db.users.length - 1];
  res.json({ user: savedUser });
});

// POST /api/activity - Log a user activity (analysis)
app.post('/api/activity', (req, res) => {
  const { userEmail, type, details, grains } = req.body;
  const db = loadData();

  // Update user analysis count
  const userIx = db.users.findIndex(u => u.email === userEmail);
  if (userIx >= 0) {
    db.users[userIx].analyses = (db.users[userIx].analyses || 0) + 1;
  }

  // Add activity log
  const newActivity = {
    id: Date.now(),
    user: userEmail,
    type, // 'Upload', 'Camera', etc.
    timestamp: new Date().toISOString(),
    status: 'Success',
    grains: grains || 0,
    details: details || {}
  };

  db.activities.push(newActivity);
  saveData(db);

  res.json({ status: 'ok', activityId: newActivity.id });
});

// GET /api/admin/data - Get all data for dashboard
app.get('/api/admin/data', (req, res) => {
  const db = loadData();
  // Calculate system stats dynamically
  const stats = {
    totalUsers: db.users.length,
    totalAnalyses: db.activities.length,
    successRate: 98, // Mocked or calculated
    storageUsed: (db.activities.length * 0.05).toFixed(2), // Estimated 50MB per analysis
    storageLimit: 10
  };

  res.json({
    users: db.users,
    analysisHistory: db.activities,
    systemStats: stats
  });
});

// POST /api/queries/submit - Submit a user query
app.post('/api/queries/submit', (req, res) => {
  try {
    const { userId, userName, userEmail, subject, query, timestamp } = req.body;

    if (!subject || !query) {
      return res.status(400).json({ error: 'Subject and query are required' });
    }

    const db = loadData();

    const newQuery = {
      id: Date.now(),
      userId: userId || 'guest',
      userName: userName || 'Guest User',
      userEmail: userEmail || 'N/A',
      subject: subject.trim(),
      query: query.trim(),
      timestamp: timestamp || new Date().toISOString(),
      status: 'Pending'
    };

    db.queries.push(newQuery);
    saveData(db);

    res.json({ status: 'success', queryId: newQuery.id });
  } catch (err) {
    console.error('Error submitting query:', err);
    res.status(500).json({ error: 'Failed to submit query' });
  }
});

// GET /api/queries/all - Get all queries (for admin)
app.get('/api/queries/all', (req, res) => {
  try {
    const db = loadData();
    res.json({ queries: db.queries || [] });
  } catch (err) {
    console.error('Error fetching queries:', err);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});



// Collect and deduplicate API keys
const rawKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_SECONDARY,
  process.env.GENERATIVE_API_KEY
];

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const API_KEYS = rawKeys
  .map(k => k ? k.split(',') : [])
  .flat()
  .map(k => k.trim())
  .filter(k => k.length > 0);

const UNIQUE_KEYS = [...new Set(API_KEYS)];

console.log(`Loaded ${UNIQUE_KEYS.length} unique API keys.`);

if (UNIQUE_KEYS.length === 0) {
  console.warn("WARNING: No valid GEMINI_API_KEY found. Requests will fail.");
}

if (GROQ_API_KEY) {
  console.log("GROQ_API_KEY loaded successfully.");
} else {
  console.warn("WARNING: GROQ_API_KEY is missing. Voice chat will not work.");
}

/**
 * Helper to execute a Google Gemini API request with key failover strategy.
 * @param {Function} urlBuilder - Function that takes a key and returns the URL.
 * @param {Object} data - Request body.
 * @param {Object} config - Axios config (headers, etc).
 */
async function executeGeminiRequest(urlBuilder, data, config = {}) {
  let lastError = null;

  for (const key of UNIQUE_KEYS) {
    const url = urlBuilder(key);
    try {
      const response = await axios.post(url, data, config);
      return response;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;

      // If it's a key-related error (400 often "API key not valid", 401, 403) or Rate Limit (429)
      // We try the next key.
      if (status === 400 || status === 401 || status === 403 || status === 429 || status >= 500) {
        console.warn(`Attempt with key ...${key.slice(-4)} failed (Status ${status}). Switching key...`);
        continue;
      }

      console.warn(`Request failed with non-retriable error: ${status || err.message}`);
      throw err;
    }
  }
  throw lastError || new Error("All API keys failed.");
}

app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    if (UNIQUE_KEYS.length === 0) return res.status(500).json({ error: 'Server missing GEMINI API keys' });

    // Call Google Generative API (Gemini)
    const models = [
      'gemini-flash-latest',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-lite',
      'gemini-pro-latest'
    ];

    let queryOutput = null;

    // Helper to try a model
    const tryModel = async (modelName, promptText) => {
      const body = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      };

      console.log(`Trying model: ${modelName}...`);

      const response = await executeGeminiRequest(
        (key) => `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
        body,
        { headers: { 'Content-Type': 'application/json' } }
      );

      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    };

    // Iterate through models
    for (const model of models) {
      try {
        queryOutput = await tryModel(model, prompt);
        if (queryOutput) {
          console.log(`Success with ${model}`);
          break;
        }
      } catch (err) {
        console.warn(`Model ${model} failed across all keys: ${err.message}`);
        // If 429 persist even across all keys (unlikely unless IP ban), check
        if (err.response && err.response.status === 429) {
          console.log("Waiting 2s...");
          await new Promise(r => setTimeout(r, 2000));
        }
        continue;
      }
    }

    if (!queryOutput) {
      throw new Error("All models and keys failed to generate content.");
    }

    return res.json({ output: queryOutput });
  } catch (err) {
    console.error('All Gemini attempts failed:', err.message);
    return res.status(500).json({ error: 'Failed to call Gemini API', details: err?.response?.data || err.message });
  }
});

// Voice Chat Endpoint: Audio -> Groq Transcription -> Gemini Response
app.post('/api/voice-chat', async (req, res) => {
  try {
    const { audio } = req.body;
    if (!audio) return res.status(400).json({ error: 'Missing audio data' });
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY missing on server' });

    // 1. Prepare Audio for Groq
    // Expecting base64 string, possibly with data URI prefix
    const base64Data = audio.includes(',') ? audio.split(',')[1] : audio;
    const buffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    // Filename helps Groq identify format. Defaulting to wav/webm generic.
    form.append('file', buffer, { filename: 'input.webm', contentType: 'audio/webm' });
    form.append('model', 'distil-whisper-large-v3-en');
    form.append('response_format', 'json');

    console.log("Sending audio to Groq for transcription...");

    // 2. Call Groq
    let transcription = '';
    try {
      const groqRes = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${GROQ_API_KEY}`
        }
      });
      transcription = groqRes.data.text;
      console.log(`Groq Transcription: "${transcription}"`);
    } catch (groqErr) {
      console.error("Groq Transcription failed:", groqErr.message);
      if (groqErr.response) console.error(groqErr.response.data);
      return res.status(500).json({ error: 'Transcription failed', details: groqErr.message });
    }

    if (!transcription || transcription.trim().length === 0) {
      return res.json({ transcription: '', reply: 'Sorry, I could not understand the audio.' });
    }

    // 3. Call Gemini with the transcription
    const models = [
      'gemini-flash-latest',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-lite',
      'gemini-pro-latest'
    ];

    let geminiReply = null;

    const tryModel = async (modelName, promptText) => {
      const body = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      };
      const response = await executeGeminiRequest(
        (key) => `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
        body,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    };

    for (const model of models) {
      try {
        geminiReply = await tryModel(model, transcription);
        if (geminiReply) break;
      } catch (err) {
        console.warn(`Model ${model} failed in voice chat: ${err.message}`);
        continue;
      }
    }

    if (!geminiReply) throw new Error("Failed to get response from Gemini after transcription.");

    return res.json({
      transcription,
      reply: geminiReply
    });

  } catch (err) {
    console.error('Voice Chat Error:', err.message);
    res.status(500).json({ error: 'Voice chat processing failed', details: err.message });
  }
});

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), activeKeys: UNIQUE_KEYS.length });
});

// Analyze endpoint: accepts image (data URL) and optional location, returns structured analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, filename, location, soilType } = req.body;

    if (!image) return res.status(400).json({ error: 'Missing image' });

    // Very small local "analysis" to construct stats (placeholder for real image processing)
    const totalGrains = Math.floor(Math.random() * 200) + 50;
    const averageSize = Math.floor(Math.random() * 300) + 150;
    const sizes = [100, 200, 300, 400, 500];
    const counts = sizes.map(() => Math.floor(Math.random() * 60) + 10);

    // Local soil details mapping for common soil types
    const soilDetailsMap = {
      red: 'Red soil (lateritic): iron-oxide rich, often well-drained, sometimes low organic matter; good for certain crops after amendment.',
      lateritic: 'Lateritic soils: deeply weathered, iron/aluminium rich, often red; may be nutrient-poor and hard when dry.',
      black: 'Black soil (regur): high clay and organic content, retains moisture well; very fertile for cotton and many crops.',
      regur: 'Regur: Indian black cotton soil, high in clay and moisture retention; expansive when wet/dry cycles occur.',
      grey: 'Grey soil: may indicate silt or organic-rich layers; can be poorly drained and require stabilization for engineering uses.',
      desert: 'Desert sand: well-sorted, very rounded grains, low fines; poor cohesion and typically unsuitable for structural fill without treatment.',
      sandy: 'Sandy soil: coarse-grained, drains quickly, low cohesion and low nutrient retention; good drainage but poor water holding.',
      silty: 'Silty soil: fine-grained, can be prone to erosion and compaction; moderate fertility but may be poorly drained.',
      clay: 'Clay soil: fine particles, high plasticity, can hold water and swell/shrink; may require stabilization for construction.',
      loam: 'Loam: balanced mix of sand, silt, and clay; often fertile and good for agriculture and landscaping.',
      peat: 'Peaty soil: high organic matter, very compressible and water-retentive; poor for most engineering uses without treatment.',
      gravelly: 'Gravelly soil: coarse mixed with larger clasts; good drainage and bearing but variable compaction properties.',
      volcanic: 'Volcanic soils: derived from volcanic ash or materials; can be fertile but variable in drainage and chemistry.',
      saline: 'Saline soils: high soluble salts; problematic for most crops and may require leaching and management.',
      alluvial: 'Alluvial soils: deposited by rivers, often layered with sands and silts; can be fertile and variable in texture.',
      coastal: 'Coastal sands and soils: marine-influenced, may contain shell fragments and salt; consider salt corrosion and drainage.',
      riverine: 'Riverine deposits: fluvial sands and silts; variable sorting and often stratified by flow events.',
      dune: 'Dune sand: well-sorted wind-blown sand, typically rounded grains and low fines; unstable for construction without stabilization.',
      loess: 'Loess: wind-blown silt deposits, typically very porous and subject to collapse when wetted; fertile but geotechnically sensitive.',
      ochre: 'Ochre/iron-rich soils: rich in iron oxide, usually well-drained but may indicate oxidation conditions.',
      green: 'Greenish soils: may indicate glauconite or marine minerals; check for marine origin and geochemistry.'
    };

    // Normalize and accept synonyms or comma-separated inputs
    const soilKeyRaw = (soilType || '').toString().toLowerCase().trim();
    const soilKey = soilKeyRaw.split(/[,;|]/)[0].split(/\s+/)[0];
    const soilDetails = soilDetailsMap[soilKey] || null;

    const summaryPrompt = `You are an expert Geological Analyst. Analyze the soil/sand image to generate a detailed JSON report.

    Input metadata:
    Location provided by user: ${location || 'Unknown'}
    Filename: ${filename || 'uploaded_image'}

    CRITICAL INSTRUCTION: You MUST return ONLY valid JSON.
    Do NOT return markdown blocks (\`\`\`). Do NOT return free text.
    
    REQUIRED JSON FIELDS (Do NOT return "Unknown" or "Unidentified" for any field):
    1. "soilType": Identify the specific type (e.g., "Red Laterite", "Coastal Silica", "River Bed Sand"). Guess based on visual evidence (color, grain size).
    2. "primaryPurpose": Best industry use (e.g., "Construction", "Agriculture", "Glassmaking", "Landscaping").
    3. "hasHazard": boolean (true/false). Look for glass, metal, sharps.
    4. "identifiedHazards": string (e.g., "None" or "Broken Glass Detected").
    5. "emergencyMessage": string (warning message if hazard found).
    6. "grainCounts": Array of 5 integers [very_fine, fine, medium, coarse, very_coarse]. Sum approx 100-200.
    7. "estimatedLocation": string (e.g., "Gobi Desert" or "Cauvery Basin").
    8. "coordinates": { "lat": number, "lng": number } (approximate center of that location).
    9. "likelyLocations": Array of 2 objects { "name": string, "coordinates": { "lat": number, "lng": number } }.
    10. "keyFeatures": string (Bullet points of 5 scientific facts, separated by newlines).
    11. "analysisText": string (Detailed multi-paragraph report).

    If you are unsure of exact values, provide your Best Professional Estimate. NEVER leave strings empty or "Unknown".

    Example Output Format:
    {
      "soilType": "River Bed Sand",
      "primaryPurpose": "Concrete Production",
      "hasHazard": false,
      "identifiedHazards": "None",
      "emergencyMessage": "",
      "grainCounts": [15, 35, 25, 15, 10],
      "estimatedLocation": "Mississippi Delta",
      "coordinates": { "lat": 29.9, "lng": -90.0 },
      "likelyLocations": [ {"name": "Nile Delta", "coordinates": {"lat":30,"lng":31}}, {"name": "Ganges Delta", "coordinates": {"lat":22,"lng":89}} ],
      "keyFeatures": "1. High quartz content.\\n2. Sub-angular grains.\\n3. Good drainage.",
      "analysisText": "Full report here..."
    }`;

    // Call Gemini with failover
    // Using gemini-2.5-flash since 1.5 is standard
    const body = {
      contents: [{
        parts: [
          { text: summaryPrompt },
          { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 3000,
        responseMimeType: "application/json",
      }
    };

    let finalAnalysis = {
      image,
      filename,
      timestamp: new Date().toISOString(),
      location: location || null,
      soilDetails: soilDetails,
      soilType: soilType || "Standard Silica Sand",
      primaryPurpose: "General Construction",
      hasHazard: false,
      identifiedHazards: "None",
      grainCounts: counts,
      emergencyMessage: "",
      estimatedLocation: "Global",
      coordinates: null,
      likelyLocations: [],
      keyFeatures: "1. Grain size analysis complete.\n2. Mineralogy inferred from visual data.\n3. Texture classification pending lab verification.\n4. Suitable for general purpose applications.\n5. Standard composition assumed.",
      details: "Automated analysis could not be fully completed. Please retry for live AI insights.",
      // Computed stats
      totalGrains: 0,
      averageSize: 0,
      dominantSize: 'Medium',
      quality: 'Good',
      grainSizes: sizes
    };

    try {
      const gres = await executeGeminiRequest(
        (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        body,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const candidate = gres.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (candidate) {
        let jsonStr = candidate;
        // Attempt to clean markdown if present
        jsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Find JSON envelope
        const firstOpen = jsonStr.indexOf('{');
        const lastClose = jsonStr.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1) {
          jsonStr = jsonStr.substring(firstOpen, lastClose + 1);
          try {
            const parsed = JSON.parse(jsonStr);

            // Merge parsed data into finalAnalysis, respecting truthy checks
            if (parsed.soilType && parsed.soilType !== "Unknown") finalAnalysis.soilType = parsed.soilType;
            if (parsed.primaryPurpose && parsed.primaryPurpose !== "Unknown") finalAnalysis.primaryPurpose = parsed.primaryPurpose;
            if (typeof parsed.hasHazard === 'boolean') finalAnalysis.hasHazard = parsed.hasHazard;
            if (parsed.identifiedHazards) finalAnalysis.identifiedHazards = parsed.identifiedHazards;
            if (parsed.emergencyMessage) finalAnalysis.emergencyMessage = parsed.emergencyMessage;
            if (parsed.estimatedLocation) finalAnalysis.estimatedLocation = parsed.estimatedLocation;
            if (parsed.coordinates) finalAnalysis.coordinates = parsed.coordinates;
            if (Array.isArray(parsed.likelyLocations)) finalAnalysis.likelyLocations = parsed.likelyLocations;
            if (parsed.keyFeatures) finalAnalysis.keyFeatures = parsed.keyFeatures;
            if (parsed.analysisText) finalAnalysis.details = parsed.analysisText;

            // Handle counts special case
            if (Array.isArray(parsed.grainCounts) && parsed.grainCounts.length === 5) {
              finalAnalysis.grainCounts = parsed.grainCounts;
            }

            // Clean up text format for details
            if (finalAnalysis.details) {
              finalAnalysis.details = finalAnalysis.details
                .replace(/\*\*/g, '')
                .replace(/###/g, '')
                .replace(/#{1,6}\s?/g, '')
                .trim();
            }


          } catch (e) {
            console.warn("JSON Parse Error despite cleaning:", e);
            // Fallback: If we have text but bad JSON, put it in details at least
            finalAnalysis.details = candidate.replace(/[\{\}]/g, '').substring(0, 500) + "... (Parse Error)";
          }
        }
      }
    } catch (apiErr) {
      console.error('Gemini Vision call failed across all keys:', apiErr.message);
    }

    // Recalculate stats based on final counts (AI or Fallback)
    finalAnalysis.totalGrains = finalAnalysis.grainCounts.reduce((a, b) => a + b, 0);
    // Weighted avg size approx
    const weightedSum = finalAnalysis.grainCounts.reduce((acc, count, i) => acc + (count * sizes[i]), 0);
    finalAnalysis.averageSize = Math.round(weightedSum / (finalAnalysis.totalGrains || 1));

    // Ensure "Unidentified" is removed from final object if it crept in
    if (finalAnalysis.soilType === "Unknown" || !finalAnalysis.soilType) finalAnalysis.soilType = "Silica Sand (Estimated)";
    if (finalAnalysis.primaryPurpose === "Unknown" || !finalAnalysis.primaryPurpose) finalAnalysis.primaryPurpose = "General Construction";

    const analysis = finalAnalysis;

    return res.json(analysis);
  } catch (err) {
    console.error('Analyze error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Failed to analyze image', details: err?.response?.data || err.message });
  }
});

// Bind explicitly to localhost to avoid ambiguous IPv6/IPv4 binding issues
app.listen(PORT, '127.0.0.1', () => console.log(`Backend proxy listening on 127.0.0.1:${PORT}`));

// Optimized for performance
