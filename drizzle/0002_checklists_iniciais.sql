-- Itens iniciais dos checklists, definidos pela equipe da Rádio Encorajamento.
-- Só insere se a tabela estiver vazia (não sobrescreve ajustes feitos pela gestão).
INSERT INTO "checklist_items" ("kind", "group", "label", "position")
SELECT v.kind, v."group", v.label, v.position
FROM (VALUES
  ('montagem'::checklist_kind, 'Áudio', 'Microfones, receptor e pilhas (branco e vermelho pegar no Connect)', 0),
  ('montagem'::checklist_kind, 'Áudio', 'Testar os microfones', 1),
  ('montagem'::checklist_kind, 'Cenário', 'Montar fundo preto', 2),
  ('montagem'::checklist_kind, 'Cenário', 'Iluminação de fundo (apontadas para o pano)', 3),
  ('montagem'::checklist_kind, 'Cenário', 'Iluminação de frente (softbox)', 4),
  ('montagem'::checklist_kind, 'Cenário', 'Organizar as extensões para ligar todos os equipamentos', 5),
  ('montagem'::checklist_kind, 'Área externa', 'Colocar as correntes', 6),
  ('montagem'::checklist_kind, 'Área externa', 'Colocar a placa', 7),
  ('montagem'::checklist_kind, 'Área externa', 'Apagar luz do corredor', 8),
  ('montagem'::checklist_kind, 'Filmagem', 'Tripé', 9),
  ('montagem'::checklist_kind, 'Filmagem', 'Conectar o cabo SDI no conversor', 10),
  ('montagem'::checklist_kind, 'Filmagem', 'Câmera 3', 11),
  ('montagem'::checklist_kind, 'Filmagem', 'Bateria da câmera', 12),
  ('montagem'::checklist_kind, 'Filmagem', 'Cabo azul (HDMI para mini HDMI)', 13),
  ('montagem'::checklist_kind, 'Filmagem', 'Intercom 3 e 5 (câmera 3 e iluminação)', 14),
  ('desmontagem'::checklist_kind, 'Área externa', 'Retirar correntes e placa do corredor', 0),
  ('desmontagem'::checklist_kind, 'Rádio', 'Desmontar o fundo (guardar a estrutura na caixa e o pano na gaveta da rádio)', 1),
  ('desmontagem'::checklist_kind, 'Rádio', 'Softbox (descer um para o almoxarifado da mídias e dois ficam no hall entre a rádio e o streaming)', 2),
  ('desmontagem'::checklist_kind, 'Rádio', 'Extensões e parleds ficam na última prateleira do hack que fica no hall entre a rádio e o streaming', 3),
  ('desmontagem'::checklist_kind, 'Rádio', 'Colocar os móveis no lugar correto', 4),
  ('desmontagem'::checklist_kind, 'Rádio', 'Tirar sapata e deixar no tripé', 5),
  ('desmontagem'::checklist_kind, 'Rádio', 'Colocar baterias para carregar (câmera e intercoms)', 6),
  ('desmontagem'::checklist_kind, 'Rádio', 'Guardar câmera, cabo azul', 7),
  ('desmontagem'::checklist_kind, 'Rádio', 'Guardar intercoms', 8),
  ('desmontagem'::checklist_kind, 'Rádio', 'Guardar microfones e base no Connect', 9)
) AS v(kind, "group", label, position)
WHERE NOT EXISTS (SELECT 1 FROM "checklist_items");
