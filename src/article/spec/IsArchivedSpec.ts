import { Article } from "../Article";
import { SpecArticle } from "./SpecArticle";

export class IsArchivedSpec implements SpecArticle {
  isSatisfiedBy(article: Article): boolean {
    return article.isArchived();
  }
}