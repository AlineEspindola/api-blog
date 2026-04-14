import "dotenv/config";
import { pool, checkConnection }          from "./config/database.js";
import { PGArticleRepository }            from "./repository/PGArticleRepository.js";
import { MemoryArticleRepository }        from "./repository/MemoryArticleRepository.js";
import { PGPersonRepository }             from "./repository/PGPersonRepository.js";
import { MemoryPersonRepository }         from "./repository/MemoryPersonRepository.js";
import { ArticleProxy }                   from "./proxy/ArticleProxy.js";
import { PersonProxy }                    from "./proxy/PersonProxy.js";
import { createApp }                      from "./http/app.js";

const PORT       = Number(process.env.PORT ?? 3000);
const USE_MEMORY = process.env.USE_MEMORY_REPO === "true";

async function bootstrap(): Promise<void> {
  let articleRepo, personRepo;

  if (USE_MEMORY) {
    console.log("[BOOT] Repositório em memória.");
    articleRepo = new MemoryArticleRepository();
    personRepo  = new MemoryPersonRepository();
  } else {
    await checkConnection();
    articleRepo = new PGArticleRepository(pool);
    personRepo  = new PGPersonRepository(pool);
  }

  const articleProxy = new ArticleProxy(articleRepo);
  const personProxy  = new PersonProxy(personRepo);

  const app = createApp(articleProxy, personProxy);

  app.listen(PORT, () =>
    console.log(`[BOOT] Servidor em http://localhost:${PORT}`)
  );
}

bootstrap().catch((err) => {
  console.error("[BOOT] Falha ao iniciar:", err);
  process.exit(1);
});
