import type { ChatCompletionMessageParam } from '@supabase/functions-js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

export async function llamaChat(
  messages: ChatCompletionMessageParam[],
  maxTokens = 800,
  temperature = 0.8
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  if (!apiKey) throw new Error('Missing GROQ_API_KEY');

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return content || '';
} 