// Copia as migrações geradas pelo drizzle-kit (drizzle/) para a pasta que a Netlify aplica
// automaticamente a cada publicação (netlify/database/migrations/).
// Rode depois de `npm run db:generate`. Nunca edite uma migração já aplicada.
import { copyFileSync, existsSync, readdirSync, readFileSync } from "node:fs";

const from = "drizzle";
const to = "netlify/database/migrations";
for (const file of readdirSync(from).filter((f) => /^\d+_[a-z0-9_-]+\.sql$/.test(f)).sort()) {
  const dest = `${to}/${file}`;
  if (existsSync(dest)) {
    if (readFileSync(dest, "utf8") !== readFileSync(`${from}/${file}`, "utf8"))
      throw new Error(`${file} difere da versão já enviada à Netlify. Migrações aplicadas não podem ser editadas.`);
    continue;
  }
  copyFileSync(`${from}/${file}`, dest);
  console.log("+", dest);
}
