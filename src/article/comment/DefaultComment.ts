import { Comment } from "./Comment";
import { Text } from "../../text/Text";

export class DefaultComment implements Comment {
  private text: Text;

  constructor(text: Text) {
    this.text = text;
  }

  add(comment: Comment): void {
    throw new Error("Comment cannot be added to a default comment.");
  }

  remove(comment: Comment): void {
    throw new Error("Comment cannot be removed from a default comment.");
  }
  
  getChildren(): Comment[] {
    return [];
  }

  getText(): Text {
    return this.text;
  }
}
