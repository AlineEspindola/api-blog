import { Article } from "../article/Article";
import { DefaultComment } from "../article/comment/DefaultComment";
import { CommentedArticle } from "../article/CommentedArticle";
import { Email } from "../text/Email";
import { Text } from "../text/Text";
import { Person } from "./Person";

export class Reader implements Person {
  private name: Text;
  private email: Email;

  constructor(name: Text, email: Email) {
    this.name = name;
    this.email = email;
  }

  getName(): Text {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  comment(message: Text, article: Article): Article {
    const newComment = new DefaultComment(message);
    if (article instanceof CommentedArticle) {
      return article.addComment(newComment);
    }
    return new CommentedArticle(article, [newComment]);
  }

  draftArticle(article: Article): Article {
    throw new Error("Readers cannot draft articles.");
  }

  editArticle(article: Article, title?: Text, content?: Text): Article {
    throw new Error("Readers cannot edit articles.");
  }

  publishArticle(article: Article): Article {
    throw new Error("Readers cannot publish articles.");
  }

  archiveArticle(article: Article): Article {
    throw new Error("Readers cannot archive articles.");
  }
}
