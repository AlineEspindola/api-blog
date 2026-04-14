import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    const isDomain =
      msg.includes("cannot") ||
      msg.includes("already") ||
      msg.includes("not implemented") ||
      msg.includes("readers cannot");

    if (isDomain) {
      res.status(422).json({ error: err.message });
      return;
    }

    console.error("[ERROR]", err.message);
    res.status(500).json({ error: "Erro interno do servidor." });
    return;
  }

  res.status(500).json({ error: "Erro desconhecido." });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Rota não encontrada." });
}
