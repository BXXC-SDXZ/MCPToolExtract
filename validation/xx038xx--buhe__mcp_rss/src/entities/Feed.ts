import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Article } from './Article';

@Entity()
export class Feed {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  url!: string;

  @Column()
  htmlUrl!: string;

  @Column()
  category!: string;

  @OneToMany(() => Article, article => article.feed)
  articles!: Article[];
}