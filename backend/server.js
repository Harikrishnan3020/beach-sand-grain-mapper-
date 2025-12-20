
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 8000;
const API_KEY = process.env.GEMINI_API_KEY || process.env.GENERATIVE_API_KEY;

app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    if (!API_KEY) return res.status(500).json({ error: 'Server missing GEMINI API key' });

    // Call Google Generative API (Gemini)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`;

    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      }
    };

    const gres = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });

    const output = gres.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    return res.json({ output });
  } catch (err) {
    console.error('Gemini proxy error', err?.response?.data || err.message || err);
    console.error(err.stack || err);
    return res.status(500).json({ error: 'Failed to call Gemini API', details: err?.response?.data || err.message });
  }
});

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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

    const summaryPrompt = `You are a geological assistant. Provide a detailed analysis of a sand sample.
Location: ${location || 'Unknown'}
Filename: ${filename || 'uploaded_image'}
SoilType: ${soilType || 'Unknown'}
KnownSoilDetails: ${soilDetails || 'None'}
Stats: totalGrains=${totalGrains}, averageSize=${averageSize}μm, sizeBuckets=${JSON.stringify(sizes)} with counts=${JSON.stringify(counts)}.
Describe likely depositional environment, grain sorting, probable uses, and any notable observations.`;

    // Call Gemini proxy internally
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`;
    const body = {
      contents: [{
        parts: [{
          text: summaryPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      }
    };

    let output = 'No detailed analysis available.';
    try {
      const gres = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
      output = gres.data?.candidates?.[0]?.content?.parts?.[0]?.text || output;
    } catch (apiErr) {
      console.error('Gemini call failed, falling back to local summary', apiErr?.response?.data || apiErr.message || apiErr);
      // Fallback summary if Gemini is unavailable
      output = `Fallback analysis: The sample (approx avg size ${averageSize}μm) appears moderately sorted with mixed grain sizes. Likely depositional environment: fluvial or beach; suitable for general geotechnical uses. (Gemini service unavailable)`;
    }

    const analysis = {
      image,
      filename,
      totalGrains,
      averageSize,
      dominantSize: 'Medium',
      quality: 'Good',
      grainSizes: sizes,
      grainCounts: counts,
      details: output,
      soilType: soilType || null,
      soilDetails: soilDetails,
      timestamp: new Date().toISOString(),
      location: location || null,
    };

    return res.json(analysis);
  } catch (err) {
    console.error('Analyze error', err?.response?.data || err.message || err);
    console.error(err.stack || err);
    return res.status(500).json({ error: 'Failed to analyze image', details: err?.response?.data || err.message });
  }
});

// Bind explicitly to localhost to avoid ambiguous IPv6/IPv4 binding issues
app.listen(PORT, '127.0.0.1', () => console.log(`Backend proxy listening on 127.0.0.1:${PORT}`));
