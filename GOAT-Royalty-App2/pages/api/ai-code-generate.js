/**
 * AI Code Generation API
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, code, language = 'javascript', action = 'generate' } = req.body;

  if (!prompt && !code) return res.status(400).json({ error: 'Prompt or code is required' });

  const actionPrompts = {
    generate: `Generate production-ready ${language} code for: ${prompt}\n\nRequirements:\n- Clean, well-structured code\n- Proper error handling\n- Comments explaining key logic\n- Follow best practices for ${language}`,
    debug: `Debug and fix the following ${language} code. Issue: ${prompt}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide the fixed code and explain what was wrong.`,
    refactor: `Refactor the following ${language} code for better quality: ${prompt}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nImprove readability, performance, and maintainability.`,
    explain: `Explain the following ${language} code in detail:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a line-by-line explanation.`,
    optimize: `Optimize the following ${language} code for performance: ${prompt}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nFocus on speed, memory usage, and efficiency.`,
    test: `Write comprehensive unit tests for the following ${language} code:\n\n\`\`\`${language}\n${code || prompt}\n\`\`\`\n\nInclude edge cases and assertions.`,
    document: `Add comprehensive documentation to the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude JSDoc/docstrings, parameter descriptions, and usage examples.`,
    convert: `Convert the following code to ${language}:\n\n\`\`\`\n${code}\n\`\`\`\n\nMaintain the same functionality and follow ${language} best practices.`
  };

  const systemPrompt = `You are an expert ${language} developer. Provide clean, production-ready code. Return ONLY the code in a code block, followed by a brief explanation. Do not include unnecessary commentary.`;

  try {
    // Try Gemini
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${actionPrompts[action] || actionPrompts.generate}` }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
          })
        }
      );
      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
        const extractedCode = codeMatch ? codeMatch[1].trim() : text;
        const explanation = text.replace(/```[\w]*\n[\s\S]*?```/g, '').trim();
        return res.status(200).json({ code: extractedCode, explanation, provider: 'gemini' });
      }
    }

    // Try OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o', temperature: 0.3, max_tokens: 4096,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: actionPrompts[action] || actionPrompts.generate }
          ]
        })
      });
      if (openaiRes.ok) {
        const data = await openaiRes.json();
        const text = data.choices?.[0]?.message?.content || '';
        const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
        const extractedCode = codeMatch ? codeMatch[1].trim() : text;
        const explanation = text.replace(/```[\w]*\n[\s\S]*?```/g, '').trim();
        return res.status(200).json({ code: extractedCode, explanation, provider: 'openai' });
      }
    }

    // Local fallback
    return res.status(200).json({
      code: generateLocalCode(language, action, prompt),
      explanation: 'Generated using local templates. Connect an AI API key for advanced code generation.',
      provider: 'local'
    });

  } catch (error) {
    console.error('Code generation error:', error);
    return res.status(200).json({
      code: `// Error: ${error.message}\n// Please check your API configuration`,
      explanation: error.message, provider: 'error'
    });
  }
}

function generateLocalCode(language, action, prompt) {
  const templates = {
    javascript: `// Generated Code - ${prompt || 'Component'}
// Language: JavaScript

/**
 * ${prompt || 'Auto-generated function'}
 * @description Production-ready implementation
 */
function main() {
  console.log('GOAT Royalty App - Code Generator');
  
  // TODO: Implement your logic here
  // Connect an AI API key (Gemini/OpenAI) for 
  // intelligent code generation
  
  return {
    status: 'ready',
    message: 'Code generated successfully'
  };
}

module.exports = { main };`,
    python: `# Generated Code - ${prompt || 'Module'}
# Language: Python

"""
${prompt || 'Auto-generated module'}
Production-ready implementation
"""

def main():
    """Main entry point"""
    print('GOAT Royalty App - Code Generator')
    
    # TODO: Implement your logic here
    # Connect an AI API key for intelligent generation
    
    return {
        'status': 'ready',
        'message': 'Code generated successfully'
    }

if __name__ == '__main__':
    main()`,
    react: `// Generated React Component - ${prompt || 'Component'}
import React, { useState, useEffect } from 'react';

/**
 * ${prompt || 'Auto-generated React component'}
 */
export default function GeneratedComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement data fetching
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-900 rounded-xl">
      <h2 className="text-xl font-bold text-white">
        Generated Component
      </h2>
      <p className="text-gray-400 mt-2">
        Connect an AI API key for intelligent code generation.
      </p>
    </div>
  );
}`,
  };
  return templates[language] || templates.javascript;
}