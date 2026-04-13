import { Article } from "../Article";
import { SpecArticle } from "./SpecArticle";

export class IsDraftSpec implements SpecArticle {
  isSatisfiedBy(article: Article): boolean {
    return article.isDraft();
  }
}