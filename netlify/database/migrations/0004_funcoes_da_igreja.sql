-- Funções de serviço passam a ser só as definidas pela igreja:
-- "Diretor de Transmissão" e "Operador da Rádio".
-- Funções antigas salvas no cadastro são limpas (cada pessoa escolhe a sua de novo);
-- a escala dos cultos já registrados é histórico e fica como está.
UPDATE "users" SET "default_function" = NULL
WHERE "default_function" IS NOT NULL
  AND "default_function" NOT IN ('Diretor de Transmissão', 'Operador da Rádio');
