import Parser from 'rss-parser';
import { AppDataSource } from '../config/database';
import { Feed } from '../entities/Feed';
import { Article, ArticleStatus } from '../entities/Article';

export class RssService {
  private parser: Parser;
  
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'content'],
          ['description', 'description']
        ]
      }
    });
  }
  
  /**
   * 获取所有订阅源的最新文章
   */
  async fetchAllFeeds(): Promise<void> {
    try {
      const feedRepository = AppDataSource.getRepository(Feed);
      const feeds = await feedRepository.find();
      
      for (const feed of feeds) {
        await this.fetchFeed(feed);
      }
    } catch (error) {
      // Handle error silently
    }
  }
  
  /**
   * 获取单个订阅源的最新文章
   * @param feed 订阅源
   */
  private async fetchFeed(feed: Feed): Promise<void> {
    try {
      const feedData = await this.parser.parseURL(feed.url);
      const articleRepository = AppDataSource.getRepository(Article);
      
      // 获取当前时间作为抓取时间
      const fetchDate = new Date().toISOString();
      
      for (const item of feedData.items) {
        // 检查文章是否已存在
        const existingArticle = await articleRepository.findOne({
          where: { link: item.link }
        });
        
        if (!existingArticle) {
          // 创建新文章
          const article = new Article();
          article.title = item.title || '无标题';
          article.content = item.content || item.description || '';
          article.link = item.link || '';
          article.pubDate = item.pubDate || item.isoDate || fetchDate;
          article.fetchDate = fetchDate;
          article.status = ArticleStatus.NORMAL;
          article.feed = feed;
          
          await articleRepository.save(article);
        }
      }
    } catch (error) {
      // console.error(`获取订阅源 ${feed.title} 失败:`, error);
    }
  }
}