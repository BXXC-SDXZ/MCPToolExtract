import { DataSource } from 'typeorm';
import { Feed } from '../entities/Feed';
import { Article } from '../entities/Article';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// 确保环境变量已加载
dotenv.config();

// 创建数据库连接
export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE || 'mysql') as 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'mcp_rss',
  entities: [Feed, Article],
  synchronize: true,
  logging: false
});

// 初始化数据库连接
export async function initDatabase(): Promise<void> {
  try {
    // 先尝试创建数据库（如果不存在）
    const dbName = process.env.DB_DATABASE || 'mcp_rss';
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '123456'
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    // console.log(`确保数据库 ${dbName} 存在`);
    
    // 然后初始化TypeORM连接
    await AppDataSource.initialize();
    // console.log('数据库连接已初始化');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};