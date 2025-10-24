import { env } from '../env';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const MAX_PROMPT_CHARS = 30000;

function buildPrompt(title: string, url: string, content: string): string {
  const truncatedContent = content.slice(0, MAX_PROMPT_CHARS);
  return `You are a neutral editor. Summarize the following article in 6–8 sentences, factual and concise.\nInclude concrete entities (orgs, products, versions, dates), avoid hype.\nTitle: ${title}\nURL: ${url}\nContent:\n${truncatedContent}`;
}

export async function summarizeArticle(params: {
  title: string;
  url: string;
  content: string;
}): Promise<string> {
  const prompt = buildPrompt(params.title, params.url, params.content);

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as any;
  const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API returned no summary');
  }

  return text.trim();
}
