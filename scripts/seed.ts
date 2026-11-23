/**
 * Cria os itens iniciais dos checklists, apenas se ainda não existir nenhum.
 * Itens definidos pela equipe da Rádio Encorajamento. A coordenação ajusta pela tela "Equipe".
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { checklistItems } from "../src/db/schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não configurada.");
const client = postgres(url, { max: 1 });
const db = drizzle(client);

const template: Record<"montagem" | "desmontagem", [string, string[]][]> = {
  montagem: [
    ["Áudio", [
      "Microfones, receptor e pilhas (branco e vermelho pegar no Connect)",
      "Testar os microfones",
    ]],
    ["Cenário", [
      "Montar fundo preto",
      "Iluminação de fundo (apontadas para o pano)",
      "Iluminação de frente (softbox)",
      "Organizar as extensões para ligar todos os equipamentos",
    ]],
    ["Área externa", [
      "Colocar as correntes",
      "Colocar a placa",
      "Apagar luz do corredor",
    ]],
    ["Filmagem", [
      "Tripé",
      "Conectar o cabo SDI no conversor",
      "Câmera 3",
      "Bateria da câmera",
      "Cabo azul (HDMI para mini HDMI)",
      "Intercom 3 e 5 (câmera 3 e iluminação)",
    ]],
  ],
  desmontagem: [
    ["Área externa", [
      "Retirar correntes e placa do corredor",
    ]],
    ["Rádio", [
      "Desmontar o fundo (guardar a estrutura na caixa e o pano na gaveta da rádio)",
      "Softbox (descer um para o almoxarifado da mídias e dois ficam no hall entre a rádio e o streaming)",
      "Extensões e parleds ficam na última prateleira do hack que fica no hall entre a rádio e o streaming",
      "Colocar os móveis no lugar correto",
      "Tirar sapata e deixar no tripé",
      "Colocar baterias para carregar (câmera e intercoms)",
      "Guardar câmera, cabo azul",
      "Guardar intercoms",
      "Guardar microfones e base no Connect",
    ]],
  ],
};

const existing = await db.select({ id: checklistItems.id }).from(checklistItems).limit(1);
if (existing.length) {
  console.log("Checklists já existem — nada a fazer.");
} else {
  const rows = (Object.keys(template) as (keyof typeof template)[]).flatMap((kind) => {
    let position = 0;
    return template[kind].flatMap(([group, labels]) => labels.map((label) => ({ kind, group, label, position: position++ })));
  });
  await db.insert(checklistItems).values(rows);
  console.log(`${rows.length} itens de checklist criados.`);
}
await client.end();
