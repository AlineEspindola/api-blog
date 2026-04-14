import { Router, Request, Response, NextFunction } from "express";
import { PersonProxy, PersonWithId } from "../../proxy/PersonProxy.js";
import { AppError } from "../middleware/errorHandler.js";
import { PersonRole } from "../../shared/types.js";

const param = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

export function createPersonRouter(proxy: PersonProxy): Router {
  const router = Router();

  // GET /persons?role=author|reader
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw  = req.query.role;
      const role = (typeof raw === "string" ? raw : undefined) as PersonRole | undefined;
      const items = await proxy.getAll(role);
      res.json(items.map(serialize));
    } catch (err) { next(err); }
  });

  // GET /persons/:id
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await proxy.getById(param(req.params.id));
      if (!item) throw new AppError(404, "Pessoa não encontrada.");
      res.json(serialize(item));
    } catch (err) { next(err); }
  });

  // POST /persons
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, role } = req.body;

      if (!name || !email || !role)
        throw new AppError(400, "name, email e role são obrigatórios.");

      if (role !== "author" && role !== "reader")
        throw new AppError(400, "role deve ser 'author' ou 'reader'.");

      const item = await proxy.create({ name, email, role });
      res.status(201).json(serialize(item));
    } catch (err) { next(err); }
  });

  // DELETE /persons/:id
  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await proxy.delete(param(req.params.id));
      if (!deleted) throw new AppError(404, "Pessoa não encontrada.");
      res.status(204).send();
    } catch (err) { next(err); }
  });

  return router;
}

function serialize({ id, name, email, role }: PersonWithId): object {
  return { id, name, email, role };
}
