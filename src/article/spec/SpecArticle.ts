import { Article } from "../Article";

export interface SpecArticle {
  isSatisfiedBy(item: Article): boolean;
}