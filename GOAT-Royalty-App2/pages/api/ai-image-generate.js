/**
 * AI Image Generation API
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, negativePrompt, style, aspectRatio, numImages = 1, quality, guidanceScale, steps, seed } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    // Try OpenAI DALL-E
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const size = aspectRatio === '16:9' ? '1792x1024' : aspectRatio === '9:16' ? '1024x1792' : '1024x1024';
      const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${prompt}${style ? `, ${style} style` : ''}${negativePrompt ? `. Avoid: ${negativePrompt}` : ''}`,
          n: 1, size, quality: quality === 'high' ? 'hd' : 'standard'
        })
      });
      if (openaiRes.ok) {
        const data = await openaiRes.json();
        const images = data.data.map((img, i) => ({
          id: Date.now() + i, url: img.url, prompt, style, timestamp: new Date().toISOString()
        }));
        return res.status(200).json({ images, provider: 'openai' });
      }
    }

    // Try Gemini image generation
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `Create a detailed visual description for an image: ${prompt}. Style: ${style || 'digital art'}. Describe colors, composition, lighting, and mood in vivid detail.` }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
          })
        }
      );
      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const description = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({
          images: [{ id: Date.now(), url: `https://picsum.photos/seed/${seed || Date.now()}/1024/1024`, prompt, style, description, timestamp: new Date().toISOString() }],
          provider: 'gemini-description', description
        });
      }
    }

    // Fallback with placeholder
    const images = Array(numImages).fill(null).map((_, i) => ({
      id: Date.now() + i,
      url: `https://picsum.photos/seed/${(seed || Date.now()) + i}/1024/1024`,
      prompt, style, timestamp: new Date().toISOString()
    }));
    return res.status(200).json({ images, provider: 'placeholder' });

  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(200).json({
      images: [{ id: Date.now(), url: `https://picsum.photos/seed/${Date.now()}/1024/1024`, prompt, style, timestamp: new Date().toISOString() }],
      provider: 'fallback', error: error.message
    });
  }
}