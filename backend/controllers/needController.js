const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { db } = require('../config/firebase');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────
// Helper 1: Source Trust Score
// ─────────────────────────────────────────────
function getSourceTrust(source) {
  if (source === 'ngo_verified') return 'high';
  if (source === 'volunteer') return 'medium';
  return 'low';
}

// ─────────────────────────────────────────────
// Helper 2: Improved Geocoding for Delhi Region
// ─────────────────────────────────────────────
async function geocodeLocation(locationText) {
  if (!locationText || locationText.trim() === '' || locationText.toLowerCase() === 'unknown') {
    return { lat: 28.6129, lng: 77.2295 }; // Fallback: India Gate, Central Delhi
  }

  try {
    let query = locationText.trim();
    if (!query.toLowerCase().includes('delhi') && !query.toLowerCase().includes('new delhi')) {
      query += ', Delhi, India';
    }

    const encoded = encodeURIComponent(query);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=in`,
      {
        headers: { 'User-Agent': 'VeriVolunte-App/1.0' },
        timeout: 8000
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
  } catch (err) {
    console.warn(`[Geocode] Failed for "${locationText}":`, err.message);
  }

  // Delhi fallback
  return { lat: 28.6129, lng: 77.2295 };
}

// ─────────────────────────────────────────────
// Helper 3: Image → Structured Data using Gemini (Recommended)
// ─────────────────────────────────────────────
async function extractStructuredDataFromImage(imageBuffer, mimeType = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are an expert at analyzing images of messages, posters, or WhatsApp screenshots for volunteering needs.

Extract the information and return **ONLY valid JSON** (no extra text, no explanation):

{
  "title": "Short clear title (max 60 characters)",
  "skill_required": "Main skill needed (e.g. doctor, teacher, driver, medical help, food distribution, rescue)",
  "location": "Specific location in Delhi (e.g. Dwarka Sector 10, Connaught Place, Nehru Place, Rohini)",
  "urgency": "high | medium | low",
  "people_needed": number,
  "additional_needs": "Extra details or null",
  "date": "Date if mentioned or null",
  "time": "Time if mentioned or null",
  "confidence": number between 60 and 95
}

Be accurate with location. If unclear, still guess reasonably and lower confidence.
`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  let text = result.response.text().trim();

  // Clean markdown if present
  text = text.replace(/```json|```/g, '').trim();

  return JSON.parse(text);
}

// ─────────────────────────────────────────────
// Helper 4: Text → Structured Data using Gemini
// ─────────────────────────────────────────────
async function extractWithGeminiStructured(rawText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Extract volunteering need information from this message.

Message: "${rawText}"

Return **ONLY** valid JSON (no extra text):

{
  "title": "...",
  "skill_required": "...",
  "location": "...",
  "urgency": "high|medium|low",
  "people_needed": number,
  "additional_needs": "..." or null,
  "date": "..." or null,
  "time": "..." or null,
  "confidence": number (60-95)
}
`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();
  text = text.replace(/```json|```/g, '').trim();

  return JSON.parse(text);
}

// ─────────────────────────────────────────────
// MAIN CONTROLLER: POST /api/needs/extract
// ─────────────────────────────────────────────
const extractNeed = async (req, res) => {
  try {
    const { content, source } = req.body;
    const imageFile = req.file;

    if (!content && !imageFile) {
      return res.status(400).json({ error: 'Provide text (content) or image file' });
    }

    let extractedData;
    let inputType = 'text';
    let rawTextForStorage = '';

    if (imageFile) {
      extractedData = await extractStructuredDataFromImage(imageFile.buffer, imageFile.mimetype);
      inputType = 'image';
      rawTextForStorage = '[Image processed with Gemini]';
    } else {
      rawTextForStorage = content;
      extractedData = await extractWithGeminiStructured(content);
      inputType = 'text';
    }

    // Geocode the location
    const coords = await geocodeLocation(extractedData.location);

    // Build Firestore document
    const needDocument = {
      title:            extractedData.title || 'Untitled Need',
      skill_required:   extractedData.skill_required || 'general',
      location:         extractedData.location || 'Unknown',
      urgency:          extractedData.urgency || 'medium',
      people_needed:    extractedData.people_needed || 1,
      additional_needs: extractedData.additional_needs || null,
      date:             extractedData.date || null,
      time:             extractedData.time || null,
      confidence:       extractedData.confidence || 70,
      extraction_method: 'gemini_2.0_flash',

      lat: coords?.lat || null,
      lng: coords?.lng || null,

      source_trust: getSourceTrust(source || 'unknown'),
      input_type: inputType,
      raw_input: rawTextForStorage.substring(0, 500),

      created_by: req.user?.uid || 'unknown',
      created_at: new Date().toISOString(),
      status: 'open',
      matched_volunteers: []
    };

    const docRef = await db.collection('needs').add(needDocument);

    return res.status(201).json({
      message: 'Need extracted successfully using Gemini',
      need_id: docRef.id,
      extracted: needDocument
    });

  } catch (error) {
    console.error('[extractNeed] Error:', error);
    return res.status(500).json({
      error: 'Extraction failed',
      details: error.message
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/needs — fetch all stored needs
// ─────────────────────────────────────────────
const getAllNeeds = async (req, res) => {
  try {
    const snapshot = await db
      .collection('needs')
      .orderBy('created_at', 'desc')
      .get();

    const needs = [];
    snapshot.forEach(doc => {
      needs.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ needs });
  } catch (error) {
    console.error('Error fetching needs:', error);
    return res.status(500).json({ error: 'Failed to fetch needs', details: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/needs/:id — delete a need
// ─────────────────────────────────────────────
const deleteNeed = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('needs').doc(id).delete();
    return res.status(200).json({ message: 'Need deleted successfully' });
  } catch (error) {
    console.error('Error deleting need:', error);
    return res.status(500).json({ error: 'Failed to delete need', details: error.message });
  }
};

module.exports = { extractNeed, getAllNeeds, deleteNeed };