import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { Feed } from '../entities/Feed';
import { AppDataSource } from '../config/database';

interface OpmlOutline {
  text: string;
  title: string;
  type?: string;
  xmlUrl?: string;
  htmlUrl?: string;
  outline?: OpmlOutline[];
}

export class OpmlService {
  /**
   * 解析OPML文件并保存订阅源到数据库
   * @param opmlFilePath OPML文件路径
   */
  async parseAndSaveFeeds(opmlFilePath: string): Promise<void> {
    try {
      // 获取绝对路径
      const absolutePath = path.isAbsolute(opmlFilePath) 
        ? opmlFilePath 
        : path.join(process.cwd(), opmlFilePath);
      
      // console.log(`解析OPML文件: ${absolutePath}`);
      
      // 读取OPML文件
      const opmlContent = fs.readFileSync(absolutePath, 'utf-8');
      
      // 解析XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        isArray: (name: string, jpath: string) => {
          if (name === 'outline') return true;
          return false;
        },
        parseAttributeValue: true
      });
      
      const result = parser.parse(opmlContent);
      
      // 打印解析结果以便调试
      // console.log('解析结果:', JSON.stringify(result, null, 2));
      
      // 处理订阅源
      if (result.opml && result.opml.body && result.opml.body.outline) {
        // console.log('找到outline元素:', result.opml.body.outline);
        await this.processOutlines(result.opml.body.outline);
      } else {
        // console.error('OPML文件格式不正确');
      }
    } catch (error) {
      // console.error('解析OPML文件失败:', error);
    }
  }
  
  /**
   * 处理OPML中的outline元素
   * @param outlines outline元素数组
   * @param parentCategory 父分类
   */
  private async processOutlines(outlines: OpmlOutline[], parentCategory: string = '', level: number = 0): Promise<void> {
    const feedRepository = AppDataSource.getRepository(Feed);
    const indent = '  '.repeat(level);
    
    // console.log(`处理${outlines.length}个outline元素`);
    
    for (const outline of outlines) {
      // 打印当前outline的基本信息和属性
      // console.log(`${indent}└─ ${outline.title || outline.text || '未命名'}`);
      // console.log(`${indent}   类型: ${outline.type || '未指定'}`);
      // console.log(`${indent}   RSS URL: ${outline.xmlUrl || '无'}`);
      
      // 如果是RSS订阅源
      if (outline.type === 'rss' && outline.xmlUrl) {
        // 检查是否已存在
        const existingFeed = await feedRepository.findOne({
          where: { url: outline.xmlUrl }
        });
        
        if (!existingFeed) {
          // 创建新的订阅源
          const feed = new Feed();
          feed.title = outline.title || outline.text || '未命名';
          feed.url = outline.xmlUrl;
          feed.htmlUrl = outline.htmlUrl || '';
          feed.category = parentCategory;
          
          await feedRepository.save(feed);
          // console.log(`${indent}  ├─ RSS URL: ${feed.url}`);
          // console.log(`${indent}  ├─ 网站URL: ${feed.htmlUrl || '未提供'}`);
          // console.log(`${indent}  └─ 分类: ${feed.category || '未分类'}`);
        }
      }
      // 如果是分类
      else if (outline.outline) {
        const categoryName = outline.title || outline.text || '';
        await this.processOutlines(outline.outline, categoryName, level + 1);
      }
    }
  }
}