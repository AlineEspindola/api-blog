import { Article } from "./Article";
import { NullText } from "../text/NullText";
import { Text } from "../text/Text";

export class DefaultArticle implements Article {
  private text: Text;

  constructor(text?: Text) {
    this.text = text ?? new NullText();
  }

  getText(): Text {
    return this.text;
  }

  write(text: Text): Article {
    return new DefaultArticle(text);
  }
}
