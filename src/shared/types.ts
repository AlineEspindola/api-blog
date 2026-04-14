export type ArticleStatus = "draft" | "published" | "archived";
export type PersonRole    = "author" | "reader";

// ── registros vindos do banco ─────────────────────────────────

export interface ArticleRecord {
  id:             string;
  author_id:      string;
  title:          string | null;
  content:        string | null;
  status:         ArticleStatus;
  last_edited_at: Date;
  created_at:     Date;
}

export interface CommentRecord {
  id:         string;
  article_id: string;
  author_id:  string;
  parent_id:  string | null;
  content:    string;
  created_at: Date;
}

export interface PersonRecord {
  id:         string;
  name:       string;
  email:      string;
  role:       PersonRole;
  created_at: Date;
}

// ── DTOs de entrada ───────────────────────────────────────────

export interface CreateArticleDTO {
  authorId: string;
  title:    string;
  content:  string;
}

export interface UpdateArticleDTO {
  title?:   string;
  content?: string;
}

export interface CreateCommentDTO {
  authorId:  string;
  content:   string;
  parentId?: string;
}

export interface CreatePersonDTO {
  name:  string;
  email: string;
  role:  PersonRole;
}
