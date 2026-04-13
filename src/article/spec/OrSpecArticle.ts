import { Article } from "../Article";
import { SpecArticle } from "./SpecArticle";

export class OrSpecArticle implements SpecArticle {
  constructor(
    private left: SpecArticle,
    private right: SpecArticle
  ) {}

  isSatisfiedBy(item: Article): boolean {
    return (
      this.left.isSatisfiedBy(item) ||
      this.right.isSatisfiedBy(item)
    );
  }
}