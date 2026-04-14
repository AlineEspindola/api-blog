import { Pool, PoolConfig } from "pg";

const config: PoolConfig = {
  host:     process.env.DB_HOST     ?? "localhost",
  port:     Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME     ?? "api_blog",
  user:     process.env.DB_USER     ?? "postgres",
  password: process.env.DB_PASSWORD ?? "",
  max:                    20,
  idleTimeoutMillis:      30_000,
  connectionTimeoutMillis: 2_000,
};

export const pool = new Pool(config);

pool.on("error", (err) => {
  console.error("[DB] Erro inesperado no cliente idle:", err.message);
});

export async function checkConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("[DB] Conexão com PostgreSQL estabelecida.");
  } finally {
    client.release();
  }
}
