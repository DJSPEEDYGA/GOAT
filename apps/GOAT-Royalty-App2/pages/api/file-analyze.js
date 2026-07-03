/**
 * File Analysis API
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileName, fileType, fileSize, query = 'Analyze this file' } = req.body;

  const systemPrompt = `You are a file analysis AI assistant. The user has uploaded a file named "${fileName}" (type: ${fileType}, size: ${fileSize} bytes). Provide a detailed analysis based on the file type and the user's query. Be specific and actionable.`;

  try {
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser query: ${query}` }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 4096 }
          })
        }
      );
      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (analysis) return res.status(200).json({ analysis, provider: 'gemini' });
      }
    }

    return res.status(200).json({
      analysis: `📄 **File Analysis: ${fileName}**\n\nType: ${fileType}\nSize: ${(fileSize / 1024).toFixed(1)} KB\n\nTo perform AI-powered file analysis, configure your API keys (Gemini/OpenAI) in the .env file.\n\nThe File Analyzer can:\n• Extract text from PDFs\n• Parse CSV/JSON data\n• Analyze image content\n• Summarize documents\n• Answer questions about file contents`,
      provider: 'local'
    });
  } catch (error) {
    return res.status(200).json({ analysis: `Error: ${error.message}`, provider: 'error' });
  }
}