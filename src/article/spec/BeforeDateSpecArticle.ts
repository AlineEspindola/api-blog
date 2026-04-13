import { SpecArticle } from "./SpecArticle";
import { Article } from "../Article";

export class BeforeDateSpecArticle implements SpecArticle {
  constructor(private date: Date) {}

  isSatisfiedBy(article: Article): boolean {
    return article.getLastEdited().getTime() < this.date.getTime();
  }
}