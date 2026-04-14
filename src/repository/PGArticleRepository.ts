import { Pool } from "pg";
import { ArticleRepository } from "./ArticleRepository.js";
import {
  ArticleRecord,
  CommentRecord,
  CreateArticleDTO,
  UpdateArticleDTO,
  CreateCommentDTO,
  ArticleStatus,
} from "../shared/types.js";

export class PGArticleRepository implements ArticleRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<ArticleRecord | null> {
    const { rows } = await this.pool.query<ArticleRecord>(
      "SELECT * FROM articles WHERE id = $1",
      [id]
    );
    return rows[0] ?? null;
  }

  async findAll(status?: ArticleStatus): Promise<ArticleRecord[]> {
    if (status) {
      const { rows } = await this.pool.query<ArticleRecord>(
        "SELECT * FROM articles WHERE status = $1 ORDER BY created_at DESC",
        [status]
      );
      return rows;
    }
    const { rows } = await this.pool.query<ArticleRecord>(
      "SELECT * FROM articles ORDER BY created_at DESC"
    );
    return rows;
  }

  async findByAuthor(authorId: string): Promise<ArticleRecord[]> {
    const { rows } = await this.pool.query<ArticleRecord>(
      "SELECT * FROM articles WHERE author_id = $1 ORDER BY created_at DESC",
      [authorId]
    );
    return rows;
  }

  async create(dto: CreateArticleDTO): Promise<ArticleRecord> {
    const { rows } = await this.pool.query<ArticleRecord>(
      `INSERT INTO articles (author_id, title, content, status)
       VALUES ($1, $2, $3, 'draft') RETURNING *`,
      [dto.authorId, dto.title, dto.content]
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateArticleDTO): Promise<ArticleRecord | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (dto.title   !== undefined) { fields.push(`title = $${i++}`);   values.push(dto.title); }
    if (dto.content !== undefined) { fields.push(`content = $${i++}`); values.push(dto.content); }
    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await this.pool.query<ArticleRecord>(
      `UPDATE articles SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] ?? null;
  }

  async updateStatus(id: string, status: ArticleStatus): Promise<ArticleRecord | null> {
    const { rows } = await this.pool.query<ArticleRecord>(
      "UPDATE articles SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    return rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      "DELETE FROM articles WHERE id = $1", [id]
    );
    return (rowCount ?? 0) > 0;
  }

  async findComments(articleId: string): Promise<CommentRecord[]> {
    const { rows } = await this.pool.query<CommentRecord>(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC",
      [articleId]
    );
    return rows;
  }

  async addComment(articleId: string, dto: CreateCommentDTO): Promise<CommentRecord> {
    const { rows } = await this.pool.query<CommentRecord>(
      `INSERT INTO comments (article_id, author_id, parent_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [articleId, dto.authorId, dto.parentId ?? null, dto.content]
    );
    return rows[0];
  }
}
