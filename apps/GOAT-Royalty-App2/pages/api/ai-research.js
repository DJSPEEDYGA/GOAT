/**
 * AI Research API - Deep Research with Citations
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, researchType = 'comprehensive', depth = 'standard', enableGrounding, enableFactCheck, deep } = req.body;

  if (!query) return res.status(400).json({ error: 'Query is required' });

  const depthInstructions = {
    quick: 'Provide a brief overview with 3-5 key points.',
    standard: 'Provide a thorough analysis with 8-12 key findings.',
    deep: 'Provide an exhaustive analysis with 15-25 detailed findings.',
    exhaustive: 'Provide the most comprehensive analysis possible with 30+ findings, data points, and actionable insights.'
  };

  const typeInstructions = {
    comprehensive: 'Conduct a comprehensive multi-faceted research analysis.',
    market: 'Focus on market size, growth trends, key players, and opportunities.',
    competitive: 'Analyze competitors, their strengths/weaknesses, market positioning, and strategies.',
    trend: 'Identify emerging trends, patterns, and future predictions.',
    legal: 'Research relevant laws, regulations, compliance requirements, and legal precedents.',
    technical: 'Analyze technical aspects, architectures, implementations, and best practices.',
    financial: 'Focus on revenue models, financial metrics, investment opportunities, and ROI analysis.',
    audience: 'Research target demographics, behavior patterns, preferences, and engagement strategies.',
    analyze: 'Perform deep analytical research with data-driven insights.',
    plan: 'Create a strategic plan based on research findings.',
    compare: 'Provide a detailed side-by-side comparison analysis.',
    forecast: 'Generate predictions and forecasts based on current data and trends.',
    audit: 'Conduct a thorough audit and compliance review.',
    explore: 'Explore the topic broadly, identifying unexpected connections and insights.'
  };

  const systemPrompt = `You are an expert research analyst for the music industry and technology sector. ${typeInstructions[researchType] || typeInstructions.comprehensive} ${depthInstructions[depth] || depthInstructions.standard}

${enableGrounding ? 'Include specific data points, statistics, and cite your sources.' : ''}
${enableFactCheck ? 'Verify claims and note confidence levels for each finding.' : ''}
${deep ? 'This is a DEEP RESEARCH request. Be extremely thorough and detailed.' : ''}

Format your response as a structured research report with:
1. Executive Summary
2. Key Findings (numbered)
3. Detailed Analysis
4. Data & Statistics
5. Recommendations
6. Sources & References

Context: GOAT Royalty App - Music production and royalty management platform with 346 tracks, 1.2B+ streams, $865K+ royalties.`;

  try {
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nResearch Query: ${query}` }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
          })
        }
      );
      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const report = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (report) {
          return res.status(200).json({
            report, provider: 'gemini',
            sources: extractSources(report),
            metadata: { type: researchType, depth, query, timestamp: new Date().toISOString() }
          });
        }
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o', temperature: 0.4, max_tokens: 8192,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Research Query: ${query}` }]
        })
      });
      if (openaiRes.ok) {
        const data = await openaiRes.json();
        const report = data.choices?.[0]?.message?.content;
        if (report) {
          return res.status(200).json({
            report, provider: 'openai',
            sources: extractSources(report),
            metadata: { type: researchType, depth, query, timestamp: new Date().toISOString() }
          });
        }
      }
    }

    return res.status(200).json({
      report: generateLocalResearch(query, researchType, depth),
      provider: 'local',
      sources: ['GOAT Royalty App Internal Data', 'Music Industry Reports 2024', 'Streaming Platform Analytics'],
      metadata: { type: researchType, depth, query, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return res.status(200).json({ report: `Research error: ${error.message}`, provider: 'error', sources: [] });
  }
}

function extractSources(text) {
  const sources = [];
  const urlRegex = /https?:\/\/[^\s)]+/g;
  const matches = text.match(urlRegex);
  if (matches) sources.push(...matches.slice(0, 20));
  const refRegex = /\[(\d+)\]\s*(.+)/g;
  let match;
  while ((match = refRegex.exec(text)) !== null) {
    if (!sources.includes(match[2].trim())) sources.push(match[2].trim());
  }
  return sources.length > 0 ? sources : ['Analysis based on available data and industry knowledge'];
}

function generateLocalResearch(query, type, depth) {
  return `# Research Report: ${query}

## Executive Summary

This research report provides an analysis of "${query}" based on available data and industry knowledge. For enhanced research with real-time web data, configure your AI API keys.

## Key Findings

1. **Music Streaming Market**: The global music streaming market reached $19.3B in 2024, with projected growth to $25B+ by 2027.

2. **Platform Distribution**: Spotify leads with 31% market share, followed by Apple Music (15%), Amazon Music (13%), YouTube Music (12%), and others.

3. **Per-Stream Rates**: Average rates range from $0.003-$0.005 per stream, with Tidal offering the highest at ~$0.012.

4. **Hip-Hop/R&B Dominance**: The genre maintains 27.6% of total streaming market share in the US.

5. **Catalog Performance**: The GOAT Royalty catalog of 346 tracks with 1.2B+ streams represents significant market presence.

## Recommendations

1. Optimize playlist placement strategies across major platforms
2. Leverage short-form video platforms for catalog discovery
3. Explore sync licensing opportunities for additional revenue
4. Consider direct-to-fan monetization strategies

## Sources

- Music Industry Reports 2024
- Streaming Platform Analytics
- GOAT Royalty App Internal Data

---

*Configure AI API keys (Gemini/OpenAI) for comprehensive real-time research with web grounding and citations.*`;
}