const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const loadConfig = require('./config/loader');
const serviceDetails = require('./servicesDetails.json');

const app = express();
const PORT = process.env.PORT || 3000;

const { companyData: COMPANY_DATA, systemPrompt: SYSTEM_PROMPT } = loadConfig();

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Function to match service query
function matchServiceQuery(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  for (const [service, details] of Object.entries(serviceDetails)) {
    if (lowerMsg.includes(service.toLowerCase())) {
      return Object.entries(details)
        .map(([title, desc]) => `**${title}**\n${desc}`)
        .join('\n\n');
    }
  }
  return null;
}

// API chat route
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;



if (message.toLowerCase().includes("instagram")) {
  return res.json({ response: '📸 Follow us on Instagram: <a href="https://www.instagram.com/trackpi.in" target="_blank">instagram.com/trackpi.in</a>' });
}
if (message.toLowerCase().includes("facebook")) {
  return res.json({ response: '👍 Connect with us on Facebook: <a href="https://www.facebook.com/trackpi.in" target="_blank">facebook.com/trackpi.in</a>' });
}
if (message.toLowerCase().includes("linkedin")) {
  return res.json({ response: '💼 Find us on LinkedIn: <a href="https://www.linkedin.com/company/trackpi" target="_blank">linkedin.com/company/trackpi</a>' });
}
if (message.toLowerCase().includes("social media") || message.toLowerCase().includes("follow you")) {
  return res.json({
    response: `📱 Follow Trackpi on Social Media:\n- Instagram: https://www.instagram.com/trackpi.in\n- Facebook: https://www.facebook.com/trackpi.in\n- LinkedIn: https://www.linkedin.com/company/trackpi`
  });
}

// Social media response logic
const socialMediaKeywords = ['instagram', 'facebook', 'linkedin', 'social media', 'follow you', 'where can i find you'];
const socialLinks = `
📱 Follow Trackpi on Social Media:
- Instagram: https://www.instagram.com/trackpi.in
- Facebook: https://www.facebook.com/trackpi.in
- LinkedIn: https://www.linkedin.com/company/trackpi
`;


if (socialMediaKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
  return res.json({ response: socialLinks });
}

    // If message matches a service name, return details directly
    const matchedResponse = matchServiceQuery(message);
    if (matchedResponse) {
      return res.json({ response: matchedResponse });
    }

    // Otherwise, forward to OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL,
        'X-Title': process.env.SITE_NAME,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ response: data.choices[0].message.content });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Failed to process your request" });
  }
});

// Catch-all route
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Loaded company data:', COMPANY_DATA.name);
});