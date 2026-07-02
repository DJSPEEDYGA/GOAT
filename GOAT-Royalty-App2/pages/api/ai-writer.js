/**
 * AI Writer API - Content Generation
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, contentType = 'blog-post', tone = 'professional', length = 'medium', keywords = '', audience = '' } = req.body;

  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  const lengthGuide = { short: '200-300 words', medium: '500-700 words', long: '1000-1500 words', detailed: '2000+ words' };

  const systemPrompt = `You are an expert content writer for the music industry, specializing in royalty management, artist development, and music business. Write in a ${tone} tone. Target audience: ${audience || 'music industry professionals'}. Length: ${lengthGuide[length] || '500 words'}.${keywords ? ` Include these keywords naturally: ${keywords}` : ''}`;

  const contentPrompts = {
    'press-release': `Write a professional press release about: ${topic}\n\nInclude: headline, dateline, lead paragraph, body with quotes, boilerplate, and contact info.`,
    'blog-post': `Write a compelling blog post about: ${topic}\n\nInclude: engaging title, introduction hook, structured sections with headers, key takeaways, and conclusion with CTA.`,
    'social-media': `Create social media content about: ${topic}\n\nGenerate posts for: Instagram (with hashtags), Twitter/X (concise), LinkedIn (professional), and TikTok (trendy). Include emoji suggestions.`,
    'email': `Write a professional email about: ${topic}\n\nInclude: subject line, greeting, clear body, call-to-action, and professional sign-off.`,
    'marketing': `Write marketing copy about: ${topic}\n\nInclude: headline, subheadline, key benefits, social proof elements, and strong CTA.`,
    'bio': `Write a professional artist/company bio about: ${topic}\n\nInclude: background, achievements, style/genre, notable collaborations, and current projects.`,
    'pitch-deck': `Create pitch deck content about: ${topic}\n\nInclude: executive summary, problem/solution, market opportunity, business model, traction, team, and ask.`,
    'contract': `Draft a legal document outline about: ${topic}\n\nInclude: parties, terms, obligations, compensation, IP rights, termination, and dispute resolution. Note: This is a template, not legal advice.`,
    'newsletter': `Write a newsletter about: ${topic}\n\nInclude: subject line, preview text, greeting, main story, secondary items, CTA, and footer.`,
    'lyrics': `Write song lyrics about: ${topic}\n\nInclude: verse 1, chorus, verse 2, chorus, bridge, final chorus. Consider rhythm, rhyme scheme, and emotional impact.`,
    'script': `Write a video/podcast script about: ${topic}\n\nInclude: hook/intro, main content sections, transitions, key talking points, and outro with CTA.`,
    'seo': `Write SEO-optimized content about: ${topic}\n\nInclude: SEO title, meta description, H1-H3 headers, keyword-rich body, internal linking suggestions, and FAQ section.`,
  };

  const prompt = contentPrompts[contentType] || contentPrompts['blog-post'];

  try {
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
          })
        }
      );
      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) return res.status(200).json({ content, provider: 'gemini' });
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o', temperature: 0.7, max_tokens: 4096,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
        })
      });
      if (openaiRes.ok) {
        const data = await openaiRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return res.status(200).json({ content, provider: 'openai' });
      }
    }

    // Local fallback
    return res.status(200).json({
      content: generateLocalContent(topic, contentType, tone),
      provider: 'local'
    });
  } catch (error) {
    return res.status(200).json({ content: `Error: ${error.message}. Connect an AI API key for content generation.`, provider: 'error' });
  }
}

function generateLocalContent(topic, type, tone) {
  return `# ${topic}

## Overview

This content was generated by the GOAT Royalty AI Writer. To unlock full AI-powered content generation with advanced language models, configure your API keys:

- **Google Gemini**: Set GOOGLE_AI_API_KEY in your .env file
- **OpenAI GPT-4**: Set OPENAI_API_KEY in your .env file

## About This Feature

The AI Writer supports 12 content types including press releases, blog posts, social media content, emails, marketing copy, artist bios, pitch decks, legal documents, newsletters, song lyrics, video scripts, and SEO content.

### Content Type: ${type}
### Tone: ${tone}
### Topic: ${topic}

---

*Configure your AI API keys to generate full, professional content tailored to your needs.*

**GOAT Royalty App** — Powered by SuperNinja AI`;
}