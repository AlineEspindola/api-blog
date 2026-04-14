import { Article } from "../article/Article";
import { DefaultArticle } from "../article/DefaultArticle";
import { Email } from "../text/Email";
import { Person } from "./Person";

import { Text } from "../text/Text";
import { DraftArticle } from "../article/DraftArticle";
import { CommentedArticle } from "../article/CommentedArticle";
import { DefaultComment } from "../article/comment/DefaultComment";
export class Author implements Person {
  private name: Text
  private email: Email;

  constructor(name: Text, email: Email) {
    this.name = name;
    this.email = email;
  }

  editArticle(article: Article, title?: Text, content?: Text): Article {
    if (!article.isDraft()) {
      throw new Error("Only draft articles can be edited.");
    }

    let editedArticle: Article = new DraftArticle(article);
    if (title) {
      editedArticle = editedArticle.writeTitle(title);
    }
    if (content) {
      editedArticle = editedArticle.write(content);
    }

    return editedArticle;
  }

  draftArticle(article: Article): Article {
    return new DraftArticle(article);
  }

  comment(message: Text, article: Article): Article {
    return new CommentedArticle(article, [new DefaultComment(message)]);
  }

  publishArticle(article: Article): Article {
    return article.publish();
  }

  archiveArticle(article: Article): Article {
    return article.archive();
  }

  getName(): Text {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }
}
