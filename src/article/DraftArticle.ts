import { Text } from "../text/Text";
import { Article } from "./Article";
import { PublishedArticle } from "./PublishedArticle";

export class DraftArticle implements Article {
  private article: Article;

  constructor(article: Article) {
    this.article = article;
  }

  isPublished(): boolean {
    return false;
  }

  isDraft(): boolean {
    return true;
  }

  isArchived(): boolean {
    return false;
  }

  getLastEdited(): Date {
    return this.article.getLastEdited();
  }

  makeEditable(): Article {
    throw new Error("This article is already editable.");
  }

  publish(): Article {
    return new PublishedArticle(this.article);
  }
  
  archive(): Article {
    throw new Error("Method not implemented.");
  }

  unarchive(): Article {
    throw new Error("Method not implemented.");
  }

  write(text: Text): Article {
    return new DraftArticle(this.article.write(text));
  }

  getText(): Text {
    return this.article.getText();
  }

  writeTitle(text: Text): Article {
    return new DraftArticle(this.article.writeTitle(text));
  }

  getTitle(): Text {
    return this.article.getTitle();
  }
}
