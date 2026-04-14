import "dotenv/config";
import { pool, checkConnection }        from "./config/database.js";
import { PGArticleRepository }          from "./repository/PGArticleRepository.js";
import { MemoryArticleRepository }      from "./repository/MemoryArticleRepository.js";
import { ArticleProxy }                 from "./proxy/ArticleProxy.js";
import { createApp }                    from "./http/app.js";

const PORT       = Number(process.env.PORT ?? 3000);
const USE_MEMORY = process.env.USE_MEMORY_REPO === "true";

async function bootstrap(): Promise<void> {
  const repository = USE_MEMORY
    ? (console.log("[BOOT] Repositório em memória."), new MemoryArticleRepository())
    : (await checkConnection(), new PGArticleRepository(pool));

  const proxy = new ArticleProxy(repository);
  const app   = createApp(proxy);

  app.listen(PORT, () =>
    console.log(`[BOOT] Servidor em http://localhost:${PORT}`)
  );
}

bootstrap().catch((err) => {
  console.error("[BOOT] Falha ao iniciar:", err);
  process.exit(1);
});
