import { GROQ_API_KEY } from '../config/env';

const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

const extractJson = (text: string) => {
  const cleanedText = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No JSON content returned from the API');
  }

  return JSON.parse(cleanedText.slice(jsonStart, jsonEnd + 1));
};

export const generateContent = async (transcript: string) => {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    throw new Error('Missing Groq API key. Add GROQ_API_KEY in .env, run npm run generate-env, then restart Metro.');
  }

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_completion_tokens: 1200,
        messages: [
          {
            role: 'system',
            content:
              'You analyze meeting transcripts and return only valid JSON. Do not include markdown fences or extra text.',
          },
          {
            role: 'user',
            content: `Analyze the following meeting transcript and return this exact JSON shape:
{
  "title": "Short descriptive meeting title, maximum 8 words.",
  "summary": "Concise meeting summary in markdown.",
  "keyDiscussionPoints": "- Bullet point\\n- Bullet point",
  "actionItems": "- Owner: action item\\n- Owner: action item",
  "followUpEmail": "Professional follow-up email draft in markdown."
}

Transcript: ${transcript}`,
          },
        ],
      }),
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    console.log('Groq API status:', response.status);
    console.log('Groq API response:', JSON.stringify(data));

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${data?.error?.message || 'Unknown error'}`);
    }

    const text = data?.choices?.[0]?.message?.content;

    if (text) {
      try {
        return extractJson(text);
      } catch {
        console.warn('Groq response was not valid JSON. Falling back to text parsing.');
        return text;
      }
    }

    throw new Error('No content returned from the API');
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};
