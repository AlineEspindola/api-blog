-- =============================================================
--  api-blog — PostgreSQL Schema
--  Gerado a partir do domínio TypeScript em src/
-- =============================================================

-- -------------------------------------------------------------
--  EXTENSÕES
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()


-- =============================================================
--  PESSOAS  (Person → Author | Reader)
-- =============================================================

CREATE TABLE persons (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    role        VARCHAR(10)   NOT NULL CHECK (role IN ('author', 'reader')),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  persons       IS 'Representa Author e Reader. Discriminado pela coluna role.';
COMMENT ON COLUMN persons.role  IS 'author = pode criar/editar/publicar/arquivar; reader = só comenta.';


-- =============================================================
--  ARTIGOS  (Article → DefaultArticle + estados + CommentedArticle)
-- =============================================================

-- O padrão State do domínio (Draft/Published/Archived) é
-- representado como uma coluna enum, evitando joins desnecessários.

CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE articles (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id     UUID            NOT NULL REFERENCES persons (id),

    title         VARCHAR(512),                   -- NullText → NULL
    content       TEXT,                           -- NullText → NULL

    status        article_status  NOT NULL DEFAULT 'draft',

    -- Mapeamento de MaxText/MinText: tamanhos máximos aplicados na camada de aplicação,
    -- mas podemos registrar aqui os limites para documentação.
    -- title  → MaxText(255) conforme Email e DefaultText sugerem
    -- content → sem limite explícito no código

    last_edited_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  articles              IS 'Artigo do blog. Status reflete o padrão State do domínio.';
COMMENT ON COLUMN articles.status       IS 'draft → published → archived (unarchive volta a draft).';
COMMENT ON COLUMN articles.author_id    IS 'Apenas persons com role=author criam artigos.';
COMMENT ON COLUMN articles.title        IS 'NULL equivale a NullText no domínio.';
COMMENT ON COLUMN articles.content      IS 'NULL equivale a NullText no domínio.';


-- =============================================================
--  COMENTÁRIOS  (Comment → DefaultComment | CommentReplied)
-- =============================================================

-- CommentReplied é um Composite: um comentário pode ter filhos.
-- Isso se mapeia naturalmente em auto-referência (adjacency list).

CREATE TABLE comments (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id  UUID          NOT NULL REFERENCES articles (id) ON DELETE CASCADE,
    author_id   UUID          NOT NULL REFERENCES persons (id),   -- Reader ou Author

    parent_id   UUID          REFERENCES comments (id) ON DELETE CASCADE,
    -- NULL → DefaultComment (raiz)
    -- NOT NULL → CommentReplied (resposta a outro comentário)

    content     TEXT          NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  comments            IS 'Comentários do artigo. Suporta threading via parent_id (CommentReplied).';
COMMENT ON COLUMN comments.parent_id  IS 'NULL = comentário raiz (DefaultComment). Preenchido = resposta (CommentReplied).';
COMMENT ON COLUMN comments.author_id  IS 'Qualquer Person pode comentar (Author ou Reader).';


-- =============================================================
--  ÍNDICES
-- =============================================================

-- Consultas frequentes de artigos por autor e status
CREATE INDEX idx_articles_author_id ON articles (author_id);
CREATE INDEX idx_articles_status    ON articles (status);

-- Listagem de comentários de um artigo, ordenados por data
CREATE INDEX idx_comments_article_id  ON comments (article_id, created_at);

-- Busca de respostas a um comentário (getChildren)
CREATE INDEX idx_comments_parent_id   ON comments (parent_id)
    WHERE parent_id IS NOT NULL;


-- =============================================================
--  RESTRIÇÕES DE NEGÓCIO  (Rules via CHECK + TRIGGER)
-- =============================================================

-- Regra: apenas authors podem criar artigos.
-- Aplicado preferencialmente na camada de aplicação, mas pode ser
-- reforçado com uma função:

CREATE OR REPLACE FUNCTION check_article_author()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF (SELECT role FROM persons WHERE id = NEW.author_id) <> 'author' THEN
        RAISE EXCEPTION 'Apenas persons com role=author podem criar artigos.';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_article_author
    BEFORE INSERT ON articles
    FOR EACH ROW EXECUTE FUNCTION check_article_author();


-- Regra: status só pode avançar conforme o domínio:
--   draft      → published
--   published  → archived | draft  (makeEditable)
--   archived   → draft             (unarchive)

CREATE OR REPLACE FUNCTION check_article_status_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;  -- sem mudança, ok
    END IF;

    IF OLD.status = 'draft'     AND NEW.status = 'published' THEN RETURN NEW; END IF;
    IF OLD.status = 'published' AND NEW.status = 'archived'  THEN RETURN NEW; END IF;
    IF OLD.status = 'published' AND NEW.status = 'draft'     THEN RETURN NEW; END IF;  -- makeEditable
    IF OLD.status = 'archived'  AND NEW.status = 'draft'     THEN RETURN NEW; END IF;  -- unarchive

    RAISE EXCEPTION 'Transição de status inválida: % → %', OLD.status, NEW.status;
END;
$$;

CREATE TRIGGER trg_article_status_transition
    BEFORE UPDATE OF status ON articles
    FOR EACH ROW EXECUTE FUNCTION check_article_status_transition();


-- Atualiza last_edited_at automaticamente ao editar título ou conteúdo
CREATE OR REPLACE FUNCTION update_last_edited()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.last_edited_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_article_last_edited
    BEFORE UPDATE OF title, content ON articles
    FOR EACH ROW EXECUTE FUNCTION update_last_edited();


-- =============================================================
--  VIEWS ÚTEIS
-- =============================================================

-- Artigos publicados com autor
CREATE VIEW published_articles AS
SELECT
    a.id,
    a.title,
    a.content,
    a.last_edited_at,
    a.created_at,
    p.name  AS author_name,
    p.email AS author_email
FROM articles a
JOIN persons  p ON p.id = a.author_id
WHERE a.status = 'published';

-- Comentários de um artigo com threading (raiz + respostas)
CREATE VIEW article_comments AS
SELECT
    c.id,
    c.article_id,
    c.parent_id,
    c.content,
    c.created_at,
    p.name  AS commenter_name,
    p.role  AS commenter_role,
    CASE WHEN c.parent_id IS NULL THEN 'root' ELSE 'reply' END AS comment_type
FROM comments c
JOIN persons  p ON p.id = c.author_id;
