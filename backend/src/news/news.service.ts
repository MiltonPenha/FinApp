import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

type NewsItem = {
  title: string;
  link: string;
};

@Injectable()
export class  NewsService {
  private parser = new Parser();
  private rssFeeds = [
    'https://rss.app/feeds/2Qkjf941mU7S58Vb.xml'
  ];

  async fetchNews(): Promise<NewsItem[]> {
    const tips: NewsItem[] = [];

    for (const feedUrl of this.rssFeeds) {
      try {
        const feed = await this.parser.parseURL(feedUrl);
        const entries = feed.items.slice(0, 5); // pega os 5 mais recentes

        for (const item of entries) {
          if (item.title && item.link) {
            tips.push({ title: item.title, link: item.link });
          }
        }
      } catch (err) {
        console.error(`Erro ao ler RSS de ${feedUrl}:`, err.message);
      }
    }

    return tips;
  }
}