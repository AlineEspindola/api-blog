import { Article } from "../Article";
import { SpecArticle } from "./SpecArticle";

export class IsPublishedSpec implements SpecArticle {
  isSatisfiedBy(article: Article): boolean {
    return article.isPublished();
  }
}