/**
 * GOAT Royalty App - Ms Vanessa Chat API Endpoint
 * Proxy to the Ms Vanessa backend service
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call the Ms Vanessa backend service
    // The backend should be running on port 4000 based on your index.js file
    const response = await fetch('http://localhost:4000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Ms Vanessa service responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Ms Vanessa API error:', error);
    
    // Fallback response if backend is not available
    const fallbackResponses = [
      "I'm Ms Vanessa, your AI assistant. I apologize, but I'm currently having trouble connecting to my backend. Please try again in a moment.",
      "As your GOAT Royalty AI assistant, I'm here to help with your music publishing needs. My connection seems unstable right now.",
      "I'm designed to help you track royalties and analyze your music career. I'm experiencing a temporary connection issue."
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return res.status(200).json({
      reply: randomResponse
    });
  }
}