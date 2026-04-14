import {
  ArticleRecord,
  CommentRecord,
  CreateArticleDTO,
  UpdateArticleDTO,
  CreateCommentDTO,
  ArticleStatus,
} from "../shared/types.js";

export interface ArticleRepository {
  findById(id: string): Promise<ArticleRecord | null>;
  findAll(status?: ArticleStatus): Promise<ArticleRecord[]>;
  findByAuthor(authorId: string): Promise<ArticleRecord[]>;

  create(dto: CreateArticleDTO): Promise<ArticleRecord>;
  update(id: string, dto: UpdateArticleDTO): Promise<ArticleRecord | null>;
  updateStatus(id: string, status: ArticleStatus): Promise<ArticleRecord | null>;
  delete(id: string): Promise<boolean>;

  findComments(articleId: string): Promise<CommentRecord[]>;
  addComment(articleId: string, dto: CreateCommentDTO): Promise<CommentRecord>;
}
