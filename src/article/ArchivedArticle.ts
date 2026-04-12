import { Text } from "../text/Text";
import { Article } from "./Article";
import { DraftArticle } from "./DraftArticle";
import { PublishedArticle } from "./PublishedArticle";

export class ArchivedArticle implements Article {
  private article: Article;

  constructor(article: Article) {
    this.article = article;
  }

  makeEditable(): Article {
    return new DraftArticle(this.article);
  }

  publish(): Article {
    throw new PublishedArticle(this.article);
  }

  archive(): Article {
    throw new Error("This article is already archived.");
  }

  unarchive(): Article {
    return new DraftArticle(this.article);
  }

  write(text: Text): Article {
    throw new Error("This article is archived and cannot be edited.");
  }

  getText(): Text {
    return this.article.getText();
  }

  writeTitle(text: Text): Article {
    throw new Error("This article is archived and cannot be edited.");
  }
  
  getTitle(): Text {
    return this.article.getTitle();
  }
  
}