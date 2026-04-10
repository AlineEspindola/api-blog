import { Text } from "../text/Text";

export interface Article {
  write(text: Text): Article;

  getText(): Text;

  writeTitle(text: Text): Article;

  getTitle(): Text;
}
