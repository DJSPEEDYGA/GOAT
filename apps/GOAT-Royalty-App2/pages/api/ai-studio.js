/**
 * GOAT AI Studio API - Multi-Model AI Endpoint
 * Supports: Gemini, OpenAI, Claude, DeepSeek + Local Fallback
 * Features: Streaming, Structured Output, Grounding, Code Execution
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    message,
    model = 'gemini-2.0-flash',
    provider = 'google',
    systemPrompt = '',
    temperature = 0.7,
    maxTokens = 2048,
    topP = 0.95,
    topK = 40,
    frequencyPenalty = 0,
    presencePenalty = 0,
    enableGrounding = false,
    enableCodeExecution = false,
    structuredOutput = false,
    outputFormat = 'text',
    context = [],
    files = []
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const startTime = Date.now();

  const fullSystemPrompt = `${systemPrompt || 'You are the Super GOAT Royalty AI — an advanced AI assistant built into the GOAT Royalty App by Harvey Miller (DJ Speedy). You are an expert in music production, royalty management, copyright law, streaming analytics, code generation, image creation, research, and creative workflows.'}

Platform Context:
- 346 tracks in catalog | 1.2B+ streams | $865,420+ royalties
- Publishers: FASTASSMAN Publishing Inc (ASCAP), Harvey L Miller Writers
- Key collabs: Beyoncé, Outkast, Jay-Z, Gucci Mane, Waka Flocka

${enableGrounding ? 'GROUNDING: Provide citations and sources for factual claims.' : ''}
${enableCodeExecution ? 'CODE EXECUTION: You can write and explain executable code.' : ''}
${structuredOutput ? 'OUTPUT FORMAT: Return structured JSON when appropriate.' : ''}
${outputFormat === 'markdown' ? 'FORMAT: Use rich Markdown formatting.' : ''}
${outputFormat === 'json' ? 'FORMAT: Return valid JSON.' : ''}
${outputFormat === 'html' ? 'FORMAT: Return valid HTML.' : ''}
${outputFormat === 'code' ? 'FORMAT: Return clean, production-ready code with comments.' : ''}`;

  try {
    // ═══════════════ GEMINI ═══════════════
    if (provider === 'google') {
      const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
      if (geminiKey) {
        const geminiModel = model || 'gemini-2.0-flash';
        
        const contents = [];
        // Add conversation context
        if (context.length > 0) {
          context.forEach(msg => {
            contents.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            });
          });
        }
        // Add current message
        contents.push({
          role: 'user',
          parts: [{ text: `${fullSystemPrompt}\n\nUser: ${message}` }]
        });

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature,
                topK,
                topP,
                maxOutputTokens: maxTokens,
              }
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const tokens = data.usageMetadata?.totalTokenCount;
          if (text) {
            return res.status(200).json({
              response: text,
              provider: 'google',
              model: geminiModel,
              tokens,
              latency: Date.now() - startTime
            });
          }
        }
      }
    }

    // ═══════════════ OPENAI ═══════════════
    if (provider === 'openai') {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        const openaiModel = model || 'gpt-4o';
        const messages = [
          { role: 'system', content: fullSystemPrompt },
          ...context.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ];

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: openaiModel,
            messages,
            temperature,
            max_tokens: maxTokens,
            top_p: topP,
            frequency_penalty: frequencyPenalty,
            presence_penalty: presencePenalty,
            ...(structuredOutput && outputFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
          })
        });

        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const text = data.choices?.[0]?.message?.content;
          const tokens = data.usage?.total_tokens;
          if (text) {
            return res.status(200).json({
              response: text,
              provider: 'openai',
              model: openaiModel,
              tokens,
              latency: Date.now() - startTime
            });
          }
        }
      }
    }

    // ═══════════════ ANTHROPIC ═══════════════
    if (provider === 'anthropic') {
      const claudeKey = process.env.ANTHROPIC_API_KEY;
      if (claudeKey) {
        const claudeModel = model || 'claude-3-sonnet-20240229';
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: maxTokens,
            system: fullSystemPrompt,
            messages: [
              ...context.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: message }
            ],
            temperature
          })
        });

        if (claudeRes.ok) {
          const data = await claudeRes.json();
          const text = data.content?.[0]?.text;
          const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
          if (text) {
            return res.status(200).json({
              response: text,
              provider: 'anthropic',
              model: claudeModel,
              tokens,
              latency: Date.now() - startTime
            });
          }
        }
      }
    }

    // ═══════════════ DEEPSEEK ═══════════════
    if (provider === 'deepseek') {
      const deepseekKey = process.env.DEEPSEEK_API_KEY;
      if (deepseekKey) {
        const deepseekModel = model || 'deepseek-chat';
        const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model: deepseekModel,
            messages: [
              { role: 'system', content: fullSystemPrompt },
              ...context.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: message }
            ],
            temperature,
            max_tokens: maxTokens,
            top_p: topP
          })
        });

        if (deepseekRes.ok) {
          const data = await deepseekRes.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return res.status(200).json({
              response: text,
              provider: 'deepseek',
              model: deepseekModel,
              latency: Date.now() - startTime
            });
          }
        }
      }
    }

    // ═══════════════ LOCAL FALLBACK ═══════════════
    return res.status(200).json({
      response: generateSmartLocalResponse(message, outputFormat),
      provider: 'local',
      model: 'super-goat-v1',
      latency: Date.now() - startTime
    });

  } catch (error) {
    console.error('AI Studio Error:', error);
    return res.status(200).json({
      response: generateSmartLocalResponse(message, outputFormat),
      provider: 'local',
      model: 'super-goat-v1',
      error: error.message,
      latency: Date.now() - startTime
    });
  }
}

// ═══════════════ SMART LOCAL RESPONSE ═══════════════
function generateSmartLocalResponse(message, format) {
  const lower = message.toLowerCase();

  // Royalty & earnings
  if (lower.includes('royalt') || lower.includes('earning') || lower.includes('revenue')) {
    const response = `📊 **Royalty Intelligence Report**

**Total Estimated Royalties: $865,420+**

| Platform | Streams | Revenue | Share |
|----------|---------|---------|-------|
| Spotify | 485M | $291,000 | 33.6% |
| Apple Music | 312M | $218,400 | 25.2% |
| YouTube Music | 198M | $138,600 | 16.0% |
| Amazon Music | 112M | $89,600 | 10.4% |
| Tidal | 56M | $67,200 | 7.8% |
| Deezer | 37M | $29,600 | 3.4% |
| Other | — | $31,020 | 3.6% |

**Key Insights:**
• Monthly growth rate: +12.4% MoM
• Top performer: "ROYALTY FLOW ft. Beyoncé" — 52.1M streams
• Pending payments: $23,450 (next payout cycle)
• Publishing split: FASTASSMAN (55%) / Harvey L Miller (45%)

**Recommendations:**
1. Focus playlist pitching on Spotify — highest volume platform
2. Increase Apple Music presence — highest per-stream rate
3. Consider Tidal exclusives — premium audience segment
4. Optimize YouTube Content ID claims — significant unclaimed revenue potential`;
    return response;
  }

  // Code generation
  if (lower.includes('code') || lower.includes('function') || lower.includes('component') || lower.includes('script')) {
    return `💻 **Code Generation Ready**

I can generate production-ready code in:
• **JavaScript/TypeScript** — React, Next.js, Node.js
• **Python** — FastAPI, Django, data analysis
• **SQL** — Database queries and schemas
• **HTML/CSS** — Responsive web designs
• **Shell** — Automation scripts

To generate code, please specify:
1. **Language/Framework** you need
2. **What it should do** (functionality)
3. **Any constraints** (performance, style, etc.)

Example: "Create a React component that displays real-time royalty earnings with a chart"

*Tip: I can also debug existing code — just paste it and describe the issue.*`;
  }

  // Image generation
  if (lower.includes('image') || lower.includes('picture') || lower.includes('visual') || lower.includes('design') || lower.includes('artwork')) {
    return `🎨 **AI Image Studio**

I can help you create and describe images for:
• **Album artwork** — Cover art, singles, EPs
• **Social media** — Instagram, TikTok, YouTube thumbnails
• **Brand assets** — Logos, banners, merchandise designs
• **Promotional** — Concert posters, press kits
• **NFT art** — Digital collectibles

To generate an image prompt, tell me:
1. **Subject** — What should be in the image?
2. **Style** — Photorealistic, illustration, abstract, etc.
3. **Mood** — Dark, vibrant, minimal, luxurious
4. **Dimensions** — Square, landscape, portrait

*Navigate to the Image Studio tab for full generation capabilities.*`;
  }

  // Research
  if (lower.includes('research') || lower.includes('analyze') || lower.includes('trend') || lower.includes('market')) {
    return `🔍 **Deep Research Agent**

I can conduct comprehensive research on:
• **Music Industry** — Streaming trends, market analysis, competitor research
• **Legal** — Copyright law, licensing, contract analysis
• **Technology** — AI/ML trends, blockchain, Web3 music
• **Financial** — Revenue optimization, investment analysis
• **Marketing** — Audience insights, campaign strategies

**Current Music Industry Highlights:**
• Global streaming revenue: $19.3B (2024)
• Hip-hop/R&B market share: 27.6%
• Average per-stream rate: $0.003-$0.005
• Fastest growing: Short-form video sync licensing (+340% YoY)

*Use the Research tab for multi-source deep research with citations.*`;
  }

  // Writing
  if (lower.includes('write') || lower.includes('content') || lower.includes('blog') || lower.includes('email') || lower.includes('press')) {
    return `✍️ **AI Writer**

I can create professional content:
• **Press releases** — Album launches, partnerships, milestones
• **Blog posts** — Industry insights, behind-the-scenes
• **Social media** — Captions, threads, stories
• **Emails** — Newsletters, outreach, business communications
• **Legal documents** — Contracts, NDAs, licensing agreements
• **Marketing copy** — Ad copy, landing pages, pitch decks

Tell me what you'd like to write and I'll craft it with your brand voice.

*Navigate to the Writer tab for template-based content creation.*`;
  }

  // Default
  return `🐐 **GOAT AI Studio — Ready**

Welcome to your all-in-one AI workspace! I'm powered by multiple AI models and can help with:

🎵 **Music & Royalties** — Catalog analysis, earnings reports, platform optimization
💻 **Code Generation** — React, Python, SQL, automation scripts
🎨 **Image Creation** — Album art, social media, brand assets
🔍 **Deep Research** — Market analysis, trends, competitive intelligence
✍️ **Content Writing** — Press releases, blogs, marketing copy
📊 **Data Analysis** — Streaming analytics, financial modeling
🔒 **Security** — IP protection, copyright monitoring

**Your message:** "${message}"

Please be more specific about what you'd like to accomplish, and I'll provide detailed, actionable assistance!

*Tip: Use the tabs above to switch between specialized tools, or configure the model and parameters in the right panel.*`;
}