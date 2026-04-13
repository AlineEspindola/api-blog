import { Article } from "./Article";
import { Comment } from "./comment/Comment";
import { Text } from "../text/Text";

export class CommentedArticle implements Article {
  private comments: Comment[];
  private article: Article;

  constructor(article: Article, comments: Comment[] = []) {
    this.article = article;
    this.comments = [...comments]; 
  }

  makeEditable(): Article {
    return new CommentedArticle(
      this.article.makeEditable(),
      this.comments
    );
  }

  archive(): Article {
    return new CommentedArticle(
      this.article.archive(),
      this.comments
    );
  }

  unarchive(): Article {
    return new CommentedArticle(
      this.article.unarchive(),
      this.comments
    );
  }

  getLastEdited(): Date {
    return this.article.getLastEdited();
  }

  isPublished(): boolean {
    return this.article.isPublished();
  }

  isDraft(): boolean {
    return this.article.isDraft();
  }

  isArchived(): boolean {
    return this.article.isArchived();
  }

  addComment(comment: Comment): CommentedArticle {
    return new CommentedArticle(
      this.article,
      [...this.comments, comment]
    );
  }

  getComments(): Comment[] {
    return [...this.comments]; 
  }

  write(text: Text): Article {
    return new CommentedArticle(
      this.article.write(text),
      this.comments
    );
  }

  writeTitle(text: Text): Article {
    return new CommentedArticle(
      this.article.writeTitle(text),
      this.comments
    );
  }

  publish(): Article {
    return new CommentedArticle(
      this.article.publish(),
      this.comments
    );
  }

  getText(): Text {
    return this.article.getText();
  }

  getTitle(): Text {
    return this.article.getTitle();
  }
}