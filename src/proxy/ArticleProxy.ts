import { ArticleRepository } from "../repository/ArticleRepository.js";
import { Article } from "../article/Article.js";
import { DefaultArticle } from "../article/DefaultArticle.js";
import { DraftArticle } from "../article/DraftArticle.js";
import { PublishedArticle } from "../article/PublishedArticle.js";
import { ArchivedArticle } from "../article/ArchivedArticle.js";
import { CommentedArticle } from "../article/CommentedArticle.js";
import { DefaultComment } from "../article/comment/DefaultComment.js";
import { CommentReplied } from "../article/comment/CommentReplied.js";
import { DefaultText } from "../text/DefaultText.js";
import { NullText } from "../text/NullText.js";
import {
  ArticleRecord,
  CommentRecord,
  ArticleStatus,
  CreateArticleDTO,
  UpdateArticleDTO,
  CreateCommentDTO,
} from "../shared/types.js";

/**
 * ArticleProxy — Padrão Proxy
 *
 * É o único ponto que conhece tanto o repositório (infra) quanto as
 * classes de domínio. Traduz ArticleRecord <-> objetos ricos sem
 * adicionar nenhum id nas classes originais.
 *
 * O id vive na camada de infra e é sempre retornado junto com o
 * objeto de domínio via ArticleWithId.
 */

export interface ArticleWithId {
  id:      string;
  article: Article;
}

export interface CommentWithId {
  id:        string;
  articleId: string;
  authorId:  string;
  parentId:  string | null;
  article:   Article; // retorna o artigo com o comentário já agregado
}

export class ArticleProxy {
  constructor(private readonly repository: ArticleRepository) {}

  // ── leitura ───────────────────────────────────────────────

  async getById(id: string): Promise<ArticleWithId | null> {
    const record = await this.repository.findById(id);
    if (!record) return null;
    return { id: record.id, article: this.recordToArticle(record) };
  }

  async getAll(status?: ArticleStatus): Promise<ArticleWithId[]> {
    const records = await this.repository.findAll(status);
    return records.map((r) => ({ id: r.id, article: this.recordToArticle(r) }));
  }

  async getByAuthor(authorId: string): Promise<ArticleWithId[]> {
    const records = await this.repository.findByAuthor(authorId);
    return records.map((r) => ({ id: r.id, article: this.recordToArticle(r) }));
  }

  async getWithComments(id: string): Promise<ArticleWithId | null> {
    const record = await this.repository.findById(id);
    if (!record) return null;

    const commentRecords = await this.repository.findComments(id);
    let article = this.recordToArticle(record);

    if (commentRecords.length > 0) {
      const comments = this.buildCommentTree(commentRecords);
      article = new CommentedArticle(article, comments);
    }

    return { id: record.id, article };
  }

  // ── escrita ───────────────────────────────────────────────

  async create(dto: CreateArticleDTO): Promise<ArticleWithId> {
    const record = await this.repository.create(dto);
    return { id: record.id, article: this.recordToArticle(record) };
  }

  async update(id: string, dto: UpdateArticleDTO): Promise<ArticleWithId | null> {
    const record = await this.repository.update(id, dto);
    if (!record) return null;
    return { id: record.id, article: this.recordToArticle(record) };
  }

  async publish(id: string): Promise<ArticleWithId | null> {
    return this.transition(id, "published");
  }

  async archive(id: string): Promise<ArticleWithId | null> {
    return this.transition(id, "archived");
  }

  async makeEditable(id: string): Promise<ArticleWithId | null> {
    return this.transition(id, "draft");
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  // ── comentários ───────────────────────────────────────────

  async addComment(articleId: string, dto: CreateCommentDTO): Promise<ArticleWithId | null> {
    const exists = await this.repository.findById(articleId);
    if (!exists) return null;
    await this.repository.addComment(articleId, dto);
    return this.getWithComments(articleId);
  }

  // ── conversões privadas ───────────────────────────────────

  /**
   * Converte um ArticleRecord plano nas classes de domínio originais,
   * sem modificar nenhuma delas.
   */
  private recordToArticle(record: ArticleRecord): Article {
    const title   = record.title   ? new DefaultText(record.title)   : new NullText();
    const content = record.content ? new DefaultText(record.content) : new NullText();
    const base    = new DefaultArticle(title, content, record.last_edited_at);

    switch (record.status) {
      case "draft":     return new DraftArticle(base);
      case "published": return new PublishedArticle(base);
      case "archived":  return new ArchivedArticle(base);
    }
  }

  /**
   * Reconstrói a árvore de comentários usando DefaultComment (folha)
   * e CommentReplied (nó com filhos) — exatamente como o domínio modela.
   */
  private buildCommentTree(records: CommentRecord[]) {
    // raízes primeiro, depois respostas
    const roots   = records.filter((r) => r.parent_id === null);
    const replies = records.filter((r) => r.parent_id !== null);

    return roots.map((root) => {
      const children = replies.filter((r) => r.parent_id === root.id);
      if (children.length === 0) {
        return new DefaultComment(new DefaultText(root.content));
      }
      const replied = new CommentReplied(
        new DefaultComment(new DefaultText(root.content))
      );
      children.forEach((c) =>
        replied.add(new DefaultComment(new DefaultText(c.content)))
      );
      return replied;
    });
  }

  private async transition(id: string, status: ArticleStatus): Promise<ArticleWithId | null> {
    const record = await this.repository.updateStatus(id, status);
    if (!record) return null;
    return { id: record.id, article: this.recordToArticle(record) };
  }
}
