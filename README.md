# api-blog

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

API de blog desenvolvida com **Node.js** e **TypeScript**, focada em arquitetura limpa e uso de Design Patterns. O sistema permite a criação e gerenciamento de artigos, comentários e usuários, com ênfase em extensibilidade, organização de regras de negócio e baixo acoplamento.

> ⚠️ **Prototype version** — branch de versão de teste, não reflete as decisões finais do projeto

---

## Sobre o projeto

Este projeto foi criado com o objetivo de **aprofundar conhecimentos em Node.js e Design Patterns**, aplicando na prática conceitos como State, Decorator, Composite e Specification em um domínio real de blog. A ideia central é demonstrar como é possível construir um sistema expressivo, extensível e com regras de negócio bem organizadas, sem depender de frameworks pesados ou ORMs.

---

## Autora

Feito com 💜 por **Aline Espindola**

[![GitHub](https://img.shields.io/badge/GitHub-AlineEspindola-181717?style=flat-square&logo=github)](https://github.com/AlineEspindola/api-blog)

---

## Sumário

- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Execução](#execução)
- [Arquitetura e Design Patterns](#arquitetura-e-design-patterns)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Domínios](#domínios)
  - [Text](#text)
  - [Article](#article)
  - [Comment](#comment)
  - [Specification (Spec)](#specification-spec)
  - [User](#user)
- [Fluxo de Estados do Artigo](#fluxo-de-estados-do-artigo)
- [Licença](#licença)

---

## Tecnologias

| Pacote | Versão | Função |
|--------|--------|--------|
| Node.js | ≥ 18 | Runtime |
| TypeScript | ^6.0.2 | Linguagem |
| Express | ^5.2.1 | Framework HTTP |
| tsx | ^4.21.0 | Execução de TypeScript em dev |

---

## Instalação

```bash
git clone https://github.com/AlineEspindola/api-blog.git
cd api-blog
npm install
```

---

## Execução

```bash
# Modo desenvolvimento (hot reload via tsx)
npm run dev
```

Saída esperada:

```
[BOOT] Repositório em memória.
[BOOT] Servidor em http://localhost:3000
```

---

## Arquitetura e Design Patterns

O projeto adota uma arquitetura orientada a objetos com os seguintes padrões:

### State Pattern
Os artigos possuem estados bem definidos (`Draft`, `Published`, `Archived`), cada um implementando a interface `Article`. A transição de estado é feita retornando uma nova instância do tipo correto, tornando o fluxo imutável e sem mutação de estado interno.

### Decorator Pattern
- `CommentedArticle` envolve qualquer `Article` adicionando suporte a comentários sem alterar o comportamento base.
- `CommentReplied` envolve um `Comment` simples adicionando suporte a respostas aninhadas (comentários filhos).
- As classes de `Text` (`MaxText`, `MinText`, `Email`) decoram um `Text` base com regras de validação compostas.

### Null Object Pattern
- `NullText` implementa `Text` retornando uma string vazia, evitando checagens de nulo.

### Composite Pattern
- `Comment` / `CommentReplied` formam uma estrutura em árvore para representar threads de comentários aninhados.

### Specification Pattern
As `SpecArticle` encapsulam regras de filtragem de artigos em objetos combináveis:
- `IsPublishedSpec`, `IsDraftSpec`, `IsArchivedSpec`
- `AfterDateSpecification`, `BeforeDateSpecArticle`
- `AndSpecArticle`, `OrSpecArticle` (composição booleana)

---

## Estrutura do Projeto

```
src/
├── index.ts                     # Entrypoint / exemplos
├── text/
│   ├── Text.ts                  # Interface base
│   ├── DefaultText.ts           # Texto simples
│   ├── NullText.ts              # Null Object
│   ├── MaxText.ts               # Decorator: limite máximo de caracteres
│   ├── MinText.ts               # Decorator: limite mínimo de caracteres
│   └── Email.ts                 # Decorator: validação de e-mail
├── article/
│   ├── Article.ts               # Interface do artigo
│   ├── DefaultArticle.ts        # Artigo base (sem estado definido)
│   ├── DraftArticle.ts          # Estado: rascunho (editável)
│   ├── PublishedArticle.ts      # Estado: publicado (somente leitura)
│   ├── ArchivedArticle.ts       # Estado: arquivado
│   ├── CommentedArticle.ts      # Decorator: artigo com comentários
│   ├── comment/
│   │   ├── Comment.ts           # Interface de comentário
│   │   ├── DefaultComment.ts    # Comentário simples (folha)
│   │   └── CommentReplied.ts    # Comentário com respostas (nó)
│   └── spec/
│       ├── SpecArticle.ts       # Interface da Specification
│       ├── IsPublishedSpec.ts
│       ├── IsDraftSpec.ts
│       ├── IsArchivedSpec.ts
│       ├── AfterDateSpecArticle.ts
│       ├── BeforeDateSpecArticle.ts
│       ├── AndSpecArticle.ts
│       └── OrSpecArticle.ts
└── user/
    ├── Person.ts                # Interface de usuário
    ├── Author.ts                # Pode criar, editar, publicar e arquivar artigos
    └── Reader.ts                # Pode apenas comentar artigos
```

---

## Domínios

### Text

Interface simples com um único método:

```ts
interface Text {
  getValue(): string;
}
```

Implementações disponíveis por composição (Decorator):

| Classe | Comportamento |
|--------|--------------|
| `DefaultText` | Armazena e retorna uma string pura |
| `NullText` | Retorna `""` (Null Object) |
| `MaxText` | Lança erro se o texto exceder `N` caracteres |
| `MinText` | Lança erro se o texto tiver menos de `N` caracteres |
| `Email` | Lança erro se o valor não contiver `@` |

Exemplo de composição:

```ts
new MinText(new MaxText(new DefaultText("Olá"), 100), 3)
```

---

### Article

Interface com ciclo de vida completo:

```ts
interface Article {
  write(text: Text): Article;
  writeTitle(text: Text): Article;
  getText(): Text;
  getTitle(): Text;
  makeEditable(): Article;
  publish(): Article;
  archive(): Article;
  unarchive(): Article;
  getLastEdited(): Date;
  isPublished(): boolean;
  isDraft(): boolean;
  isArchived(): boolean;
}
```

Implementações de estado:

| Classe | Estado | Pode editar | Pode publicar | Pode arquivar |
|--------|--------|-------------|---------------|---------------|
| `DefaultArticle` | Neutro | ✅ | ❌ | ❌ |
| `DraftArticle` | Rascunho | ✅ | ✅ | ❌ |
| `PublishedArticle` | Publicado | ❌ | ❌ | ✅ |
| `ArchivedArticle` | Arquivado | ❌ | ❌ | ❌ |

---

### Comment

```ts
interface Comment {
  getText(): Text;
  add(comment: Comment): void;
  getChildren(): Comment[];
}
```

| Classe | Comportamento |
|--------|--------------|
| `DefaultComment` | Comentário folha, não aceita filhos |
| `CommentReplied` | Aceita comentários aninhados (respostas) |

---

### Specification (Spec)

Interface:

```ts
interface SpecArticle {
  isSatisfiedBy(item: Article): boolean;
}
```

Uso com composição booleana:

```ts
const spec = new AndSpecArticle(
  new IsPublishedSpec(),
  new AfterDateSpecification(new Date("2024-01-01"))
);

const filtered = articles.filter(a => spec.isSatisfiedBy(a));
```

---

### User

Interface `Person`:

```ts
interface Person {
  getName(): Text;
  getEmail(): Email;
  comment(message: Text, article: Article): Article;
  draftArticle(article: Article): Article;
  editArticle(article: Article, title?: Text, content?: Text): Article;
  publishArticle(article: Article): Article;
  archiveArticle(article: Article): Article;
}
```

| Classe | Permissões |
|--------|-----------|
| `Author` | Criar rascunho, editar, publicar, arquivar e comentar |
| `Reader` | Apenas comentar |

---

## Fluxo de Estados do Artigo

```
DefaultArticle
      │
      ▼
 DraftArticle ◄──── ArchivedArticle (unarchive)
      │                     ▲
      │ publish()            │ archive()
      ▼                     │
PublishedArticle ────────────┘
      │
      │ makeEditable()
      ▼
 DraftArticle
```

Qualquer estado pode ser decorado com `CommentedArticle` para adicionar comentários sem alterar as regras de transição.

---

## Licença

Este projeto está sob a licença [MIT](./LICENSE).