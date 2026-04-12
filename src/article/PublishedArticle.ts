import { Text } from "../text/Text";
import { ArchivedArticle } from "./ArchivedArticle";
import { Article } from "./Article";
import { DraftArticle } from "./DraftArticle";

export class PublishedArticle implements Article {
  private article: Article;

  constructor(article: Article) {
    this.article = article;
  }

  write(text: Text): Article {
    throw new Error("This article is published and cannot be edited.");
  }

  getText(): Text {
    return this.article.getText();
  }

  writeTitle(text: Text): Article {
    throw new Error("This article is published and cannot be edited.");
  }

  getTitle(): Text {
    return this.article.getTitle();
  }

  makeEditable(): Article {
    return new DraftArticle(this.article);
  }

  publish(): Article {
    throw new Error("This article is already published.");
  }
  
  archive(): Article {
    return new ArchivedArticle(this.article);
  }

  unarchive(): Article {
    throw new Error("This article is not archived.");
  }
}