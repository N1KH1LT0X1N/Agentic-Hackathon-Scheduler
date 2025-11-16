import { env } from './env';

interface LLMContext {
  [key: string]: unknown;
}

interface LLMResponse {
  content: string;
}

/**
 * Determines LLM provider based on API key format
 */
function detectProvider(apiKey: string): 'anthropic' | 'openai' | 'stub' {
  if (!apiKey || apiKey === 'your-llm-key') return 'stub';
  if (apiKey.startsWith('sk-ant-')) return 'anthropic';
  if (apiKey.startsWith('sk-')) return 'openai';
  return 'stub';
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(prompt: string, context: LLMContext): Promise<LLMResponse> {
  const contextStr = Object.entries(context)
    .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
    .join('\n');

  const fullPrompt = `${prompt}\n\nContext:\n${contextStr}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.llmApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
  };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string, context: LLMContext): Promise<LLMResponse> {
  const contextStr = Object.entries(context)
    .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
    .join('\n');

  const fullPrompt = `${prompt}\n\nContext:\n${contextStr}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.llmApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
  };
}

/**
 * Fallback stub implementation for development/testing
 */
function callStub(prompt: string, context: LLMContext): LLMResponse {
  const summaryPieces = Object.keys(context)
    .map((key) => `${key}: ${JSON.stringify(context[key]).slice(0, 120)}`)
    .join('\n');
  return {
    content: `[STUB MODE] Hackathon Copilot response based on prompt: ${prompt.slice(0, 160)}\n\nContext:\n${summaryPieces}\n\nNote: Configure LLM_API_KEY in .env.local to enable real AI responses.`,
  };
}

/**
 * Main LLM interface - automatically routes to the appropriate provider
 */
export async function callLLM(prompt: string, context: LLMContext): Promise<LLMResponse> {
  const provider = detectProvider(env.llmApiKey);

  try {
    switch (provider) {
      case 'anthropic':
        return await callAnthropic(prompt, context);
      case 'openai':
        return await callOpenAI(prompt, context);
      case 'stub':
      default:
        return callStub(prompt, context);
    }
  } catch (error) {
    console.error('LLM call failed:', error);
    // Fallback to stub on error
    return callStub(prompt, context);
  }
}
