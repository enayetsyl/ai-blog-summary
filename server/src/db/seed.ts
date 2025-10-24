import { prisma } from './prisma';
import { feeds } from '../rss/feeds';

async function main() {
  for (const feed of feeds) {
    await prisma.source.upsert({
      where: { key: feed.key },
      create: {
        key: feed.key,
        name: feed.name,
        feedUrl: feed.url
      },
      update: {
        name: feed.name,
        feedUrl: feed.url
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
