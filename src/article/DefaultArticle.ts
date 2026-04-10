import { Article } from "./Article";
import { NullText } from "../text/NullText";
import { Text } from "../text/Text";

export class DefaultArticle implements Article {
  private text: Text;
  private title: Text;

  constructor(text?: Text, title?: Text) {
    this.text = text ?? new NullText();
    this.title = title ?? new NullText();
  }

  writeTitle(text: Text): Article {
    return new DefaultArticle(this.text, text);
  }

  getTitle(): Text {
    return this.title;
  }

  getText(): Text {
    return this.text;
  }

  write(text: Text): Article {
    return new DefaultArticle(text);
  }
}
