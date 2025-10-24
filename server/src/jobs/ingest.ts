import { prisma } from '../db/prisma';
import { logger } from '../logger';
import { feeds, feedMap } from '../rss/feeds';
import { extractArticle } from '../content/extract';
import { fetchFeedItems } from '../rss/fetchFeed';
import { summarizeArticle } from '../llm/gemini';
import { env } from '../env';
import pLimit from 'p-limit';

const limit = pLimit(5);

export async function ingestAllFeeds() {
  logger.info('Starting ingest job');

  for (const feed of feeds) {
    await ingestFeed(feed.key);
  }

  logger.info('Ingest job complete');
}

export async function ingestFeed(feedKey: string) {
  const feed = feedMap.get(feedKey);
  if (!feed) {
    logger.warn({ feedKey }, 'Unknown feed key');
    return;
  }

  logger.info({ feed: feed.key }, 'Fetching feed');
  const items = await fetchFeedItems(feed);

  const tasks = items.map((item) =>
    limit(async () => {
      try {
        if (!item.link) {
          return;
        }

        const existing = await prisma.article.findUnique({
          where: { url: item.link }
        });
        if (existing) {
          return;
        }

        const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();

        const extraction = await extractArticle(item.link);
        const content = extraction.text ?? extraction.html ?? item.content ?? item.contentSnippet ?? '';

        if (!content) {
          logger.warn({ url: item.link }, 'No content extracted, skipping summary');
          return;
        }

        const summary = await summarizeArticle({
          title: item.title,
          url: item.link,
          content
        });

        await prisma.article.create({
          data: {
            sourceKey: feed.key,
            title: item.title,
            url: item.link,
            publishedAt,
            summary,
            contentText: extraction.text
          }
        });
      } catch (error) {
        logger.error({ err: error, url: item.link }, 'Failed to ingest article');
      }
    })
  );

  await Promise.all(tasks);

  logger.info({ feed: feed.key }, 'Feed ingestion complete');
}

export async function manualIngest(token: string | undefined) {
  if (!env.ADMIN_TOKEN) {
    throw new Error('ADMIN_TOKEN is not configured');
  }

  if (!token || token !== env.ADMIN_TOKEN) {
    throw new Error('Unauthorized');
  }

  await ingestAllFeeds();
}
