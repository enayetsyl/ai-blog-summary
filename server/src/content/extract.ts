import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ExtractionResult {
  text: string | null;
  html: string | null;
}

const MAX_CONTENT_CHARS = 30000;

export async function extractArticle(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent':
          'NightlyAI-Summarizer/1.0 (+https://example.com; mailto:ops@example.com)'
      }
    });

    if (!response.ok) {
      return { text: null, html: null };
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return { text: null, html };
    }

    const text = article.textContent?.slice(0, MAX_CONTENT_CHARS) ?? null;
    const contentHtml = article.content?.slice(0, MAX_CONTENT_CHARS) ?? null;

    return { text, html: contentHtml };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('extractArticle failed', error);
    }
    return { text: null, html: null };
  }
}
