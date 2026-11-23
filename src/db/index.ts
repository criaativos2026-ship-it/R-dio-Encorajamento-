import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Local/servidor próprio: DATABASE_URL. Na Netlify: NETLIFY_DB_URL (Netlify Database).
const url = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL;
if (!url) console.warn("[db] Nenhuma conexão configurada (DATABASE_URL ou NETLIFY_DB_URL). Veja .env.example.");

// Reaproveita a conexão entre recarregamentos em desenvolvimento.
// prepare: false mantém compatibilidade com poolers usados em hospedagem serverless.
// A conexão só é aberta na primeira consulta, então o build não depende do banco.
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };
const client = globalForDb.pg ?? postgres(url ?? "postgres://indefinido@localhost/indefinido", { max: 5, prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
export { schema };
