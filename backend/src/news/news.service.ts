import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

type NewsItem = {
  title: string;
  link: string;
};

@Injectable()
export class NewsService {
  private parser = new Parser();
  private rssFeeds = [
    'https://br.investing.com/rss/news_1065.rss'
  ];

  async fetchNews(): Promise<NewsItem[]> {
    const news: NewsItem[] = [];

    for (const feedUrl of this.rssFeeds) {
      try {
        const feed = await this.parser.parseURL(feedUrl);
        const entries = feed.items.slice(0, 2); // pega os 2 mais recentes

        for (const item of entries) {
          if (item.title && item.link) {
            news.push({ title: item.title, link: item.link });
          }
        }
      } catch (err) {
        console.error(`Erro ao ler RSS de ${feedUrl}:`, err.message);
      }
    }

    return news;
  }
}