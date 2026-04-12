import { Article } from "./Article";
import { NullText } from "../text/NullText";
import { Text } from "../text/Text";

export class DefaultArticle implements Article {
  private title: Text;
  private text: Text;
  private lastEdited: Date;

  constructor(title?: Text, text?: Text, lastEdited?: Date) {
    this.title = title ?? new NullText();
    this.text = text ?? new NullText();
    this.lastEdited = lastEdited ?? new Date();
  }

  getLastEdited(): Date {
    return this.lastEdited;
  }

  makeEditable(): Article {
    throw new Error("Method not implemented.");
  }

  publish(): Article {
    throw new Error("Method not implemented.");
  }

  archive(): Article {
    throw new Error("Method not implemented.");
  }
  
  unarchive(): Article {
    throw new Error("Method not implemented.");
  }

  writeTitle(title: Text): Article {
    return new DefaultArticle(title, this.text, new Date());
  }

  getTitle(): Text {
    return this.title;
  }

  getText(): Text {
    return this.text;
  }

  write(text: Text): Article {
    return new DefaultArticle(this.title, text, new Date());
  }
}
