import { Router, Request, Response, NextFunction } from "express";
import { ArticleProxy, ArticleWithId } from "../../proxy/ArticleProxy.js";
import { AppError } from "../middleware/errorHandler.js";
import { ArticleStatus } from "../../shared/types.js";
import { CommentedArticle } from "../../article/CommentedArticle.js";

// Express 5 tipou params como Record<string, string | string[]>
const param = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

export function createArticleRouter(proxy: ArticleProxy): Router {
  const router = Router();

  // GET /articles?status=draft|published|archived
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw    = req.query.status;
      const status = (typeof raw === "string" ? raw : undefined) as ArticleStatus | undefined;
      const items  = await proxy.getAll(status);
      res.json(items.map(serialize));
    } catch (err) { next(err); }
  });

  // GET /articles/author/:authorId
  router.get("/author/:authorId", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await proxy.getByAuthor(param(req.params.authorId));
      res.json(items.map(serialize));
    } catch (err) { next(err); }
  });

  // GET /articles/:id
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await proxy.getById(param(req.params.id));
      if (!item) throw new AppError(404, "Artigo não encontrado.");
      res.json(serialize(item));
    } catch (err) { next(err); }
  });

  // GET /articles/:id/comments
  router.get("/:id/comments", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await proxy.getWithComments(param(req.params.id));
      if (!item) throw new AppError(404, "Artigo não encontrado.");
      res.json(serialize(item));
    } catch (err) { next(err); }
  });

  // POST /articles
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorId, title, content } = req.body;
      if (!authorId || !title || !content)
        throw new AppError(400, "authorId, title e content são obrigatórios.");
      const item = await proxy.create({ authorId, title, content });
      res.status(201).json(serialize(item));
    } catch (err) { next(err); }
  });

  // PATCH /articles/:id
  router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content } = req.body;
      const item = await proxy.update(param(req.params.id), { title, content });
      if (!item) throw new AppError(404, "Artigo não encontrado.");
      res.json(serialize(item));
    } catch (err) { next(err); }
  });

  // POST /articles/:id/publish
  router.post("/:id/publish", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await proxy.publish(param(req.params.id));
      if (!item) throw new AppError(404, "Artigo não encontrado.");
      res.json(serialize(item));
    } catch (err) { next(err); }
  });

  // POST /articles/:id/archive
  router.post("/:id/archive", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await proxy.archive(param(req.params.id));
      if (!item) throw new AppError(404, "Artigo não encontrado.");
      res.json(serialize(item));
    } catch (err) { next(err); }
  });

  // POST /articles/:id/unarchive
  router.post("/:id/unarchive", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await proxy.makeEditable(param(req.params.id));
      if (!item) throw new AppError(404, "Artigo não encontrado.");
      res.json(serialize(item));
    } catch (err) { next(err); }
  });

  // POST /articles/:id/comments
  router.post("/:id/comments", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorId, content, parentId } = req.body;
      if (!authorId || !content)
        throw new AppError(400, "authorId e content são obrigatórios.");
      const item = await proxy.addComment(param(req.params.id), { authorId, content, parentId });
      if (!item) throw new AppError(404, "Artigo não encontrado.");
      res.status(201).json(serialize(item));
    } catch (err) { next(err); }
  });

  // DELETE /articles/:id
  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await proxy.delete(param(req.params.id));
      if (!deleted) throw new AppError(404, "Artigo não encontrado.");
      res.status(204).send();
    } catch (err) { next(err); }
  });

  return router;
}

/**
 * Serializa ArticleWithId para JSON, usando apenas a interface pública
 * das classes de domínio — sem instanceof, sem acessar privados.
 */
function serialize({ id, article }: ArticleWithId): object {
  const status = article.isPublished() ? "published"
               : article.isDraft()     ? "draft"
               : "archived";

  const base: Record<string, unknown> = {
    id,
    title:      article.getTitle().getValue(),
    content:    article.getText().getValue(),
    status,
    lastEdited: article.getLastEdited(),
  };

  // CommentedArticle é a única classe do domínio que tem getComments()
  if (article instanceof CommentedArticle) {
    base.comments = article.getComments().map((c) => ({
      content:  c.getText().getValue(),
      children: c.getChildren().map((child) => ({
        content: child.getText().getValue(),
      })),
    }));
  }

  return base;
}
