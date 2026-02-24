// routes/ai.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Build a compact inventory summary
async function buildInventorySummary() {
  const products = await Product.find(
    {},
    'name price category quality size shadePercentage'
  ).limit(80);

  if (!products.length) {
    return 'No products are currently in the inventory.';
  }

  const grouped = {};
  for (const p of products) {
    const category = p.category || 'General';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(p);
  }

  let lines = 'Current Product Inventory (sample):\n';
  for (const [category, items] of Object.entries(grouped)) {
    lines += `\n[${category}]\n`;
    for (const p of items) {
      lines += `- ${p.name} | ₹${p.price}`;
      if (p.size) lines += ` | Size: ${p.size}`;
      if (p.quality) lines += ` | Quality: ${p.quality}`;
      if (p.shadePercentage) lines += ` | Shade: ${p.shadePercentage}%`;
      lines += '\n';
    }
  }
  return lines;
}

router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res
        .status(400)
        .json({ message: 'Prompt is required and must be a string.' });
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return res.status(400).json({ message: 'Prompt cannot be empty.' });
    }

    if (trimmedPrompt.length > 800) {
      return res.status(400).json({
        message:
          'Your question is a bit long. Please make it shorter and more specific.',
      });
    }

    const inventoryText = await buildInventorySummary();

    const systemContext = `
You are "GreenNets AI", a helpful customer support assistant for GreenNets, 
an agricultural supply store in Pune, India.

Business details:
- Location: 123 Green Street, Agricultural Zone, Pune, Maharashtra 411001
- Contact: +91 98765 43210 | info@greennets.com
- Shipping: We ship across India
- Return Policy: 15-day easy returns

Tone & style:
- Be friendly, concise and practical.
- Prefer short paragraphs and bullet points.
- When helpful, use emojis as small tags, for example:
  - 🌞 for sun/heat
  - 🌱 for plants/crops
  - 🛡️ for protection/safety
  - 💧 for rain/water protection
  - 📏 for size/measurement
  - 💰 for price/budget
- DO NOT overuse emojis. 2–6 emojis per answer is enough.

Language behaviour:
- Detect the user's language automatically from their message.
- If user is writing in Hindi or Hinglish (mix of Hindi + English), respond in a similar style.
- If the user writes in English, reply in simple, clear English.
- Product names, sizes and technical terms (like "Shade Net 90%", "Tarpaulin 200 GSM") should ALWAYS stay in English exactly as in the inventory.
- For mixed language, keep the important technical details and numbers in clean English.

Product data:
${inventoryText}

Very important rules:
1. Only talk about products that are consistent with the inventory text above.
2. If you are not sure about something (price, availability, size), say you are not sure
   and suggest that the user contact store support.
3. Do NOT invent products or policies that are not listed.
4. If the question is totally unrelated to shade nets, tarpaulins or store policies,
   politely say you are meant to help only with GreenNets products and basic guidance.

Answer format:
1) FIRST LINE: (optional) 1–3 tags in square brackets, for example:
   [Plants 🌱] [High Sun 🌞] [Budget 💰]
2) Then a blank line.
3) Then your main explanation in 4–7 short paragraphs or bullet points.
4) At the VERY END, after a blank line, output a block of recommended products using this EXACT format:

===RECOMMENDED_PRODUCTS===
<Product name 1>
<Product name 2>
<Product name 3>
===END_RECOMMENDED_PRODUCTS===

- Use product names EXACTLY as they appear in the inventory above.
- Recommend 1–3 products that best match the user's need.
- If you really cannot recommend anything, output an empty block:

===RECOMMENDED_PRODUCTS===
===END_RECOMMENDED_PRODUCTS===
`;

    const finalPrompt = `
${systemContext}

User question:
"${trimmedPrompt}"

Now answer as GreenNets AI.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(finalPrompt);
    const text = result.response.text() || '';

    const startMarker = '===RECOMMENDED_PRODUCTS===';
    const endMarker = '===END_RECOMMENDED_PRODUCTS===';

    let messageText = text;
    let recommendedProducts = [];

    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const listBlock = text
        .substring(startIndex + startMarker.length, endIndex)
        .trim();

      recommendedProducts = listBlock
        .split('\n')
        .map((line) => line.replace(/^\s*[-*]\s*/, '').trim())
        .filter(Boolean);

      messageText = (
        text.substring(0, startIndex) +
        text.substring(endIndex + endMarker.length)
      ).trim();
    }

    return res.status(200).json({
      message: messageText,
      recommendedProducts,
    });
  } catch (error) {
    console.error('AI chat error:', error?.message || error);
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message:
          'AI is currently unavailable (missing GEMINI_API_KEY). Please contact the developer.',
      });
    }
    return res.status(500).json({
      message:
        'Sorry, the AI assistant is having trouble right now. Please try again in a minute.',
    });
  }
});

module.exports = router;
