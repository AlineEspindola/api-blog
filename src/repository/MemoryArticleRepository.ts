import { randomUUID } from "crypto";
import { ArticleRepository } from "./ArticleRepository.js";
import {
  ArticleRecord,
  CommentRecord,
  CreateArticleDTO,
  UpdateArticleDTO,
  CreateCommentDTO,
  ArticleStatus,
} from "../shared/types.js";

export class MemoryArticleRepository implements ArticleRepository {
  private articles: Map<string, ArticleRecord>   = new Map();
  private comments: Map<string, CommentRecord[]> = new Map();

  async findById(id: string): Promise<ArticleRecord | null> {
    return this.articles.get(id) ?? null;
  }

  async findAll(status?: ArticleStatus): Promise<ArticleRecord[]> {
    const all = [...this.articles.values()];
    return status ? all.filter((a) => a.status === status) : all;
  }

  async findByAuthor(authorId: string): Promise<ArticleRecord[]> {
    return [...this.articles.values()].filter((a) => a.author_id === authorId);
  }

  async create(dto: CreateArticleDTO): Promise<ArticleRecord> {
    const record: ArticleRecord = {
      id:             randomUUID(),
      author_id:      dto.authorId,
      title:          dto.title,
      content:        dto.content,
      status:         "draft",
      last_edited_at: new Date(),
      created_at:     new Date(),
    };
    this.articles.set(record.id, record);
    return record;
  }

  async update(id: string, dto: UpdateArticleDTO): Promise<ArticleRecord | null> {
    const existing = this.articles.get(id);
    if (!existing) return null;
    const updated: ArticleRecord = {
      ...existing,
      title:          dto.title   ?? existing.title,
      content:        dto.content ?? existing.content,
      last_edited_at: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async updateStatus(id: string, status: ArticleStatus): Promise<ArticleRecord | null> {
    const existing = this.articles.get(id);
    if (!existing) return null;
    const updated: ArticleRecord = { ...existing, status };
    this.articles.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.articles.delete(id);
  }

  async findComments(articleId: string): Promise<CommentRecord[]> {
    return this.comments.get(articleId) ?? [];
  }

  async addComment(articleId: string, dto: CreateCommentDTO): Promise<CommentRecord> {
    const record: CommentRecord = {
      id:         randomUUID(),
      article_id: articleId,
      author_id:  dto.authorId,
      parent_id:  dto.parentId ?? null,
      content:    dto.content,
      created_at: new Date(),
    };
    const list = this.comments.get(articleId) ?? [];
    list.push(record);
    this.comments.set(articleId, list);
    return record;
  }
}
