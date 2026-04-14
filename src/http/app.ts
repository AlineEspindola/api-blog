import express, { Application } from "express";
import { ArticleProxy } from "../proxy/ArticleProxy.js";
import { createArticleRouter } from "./routes/articles.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp(articleProxy: ArticleProxy): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/articles", createArticleRouter(articleProxy));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
