import { Text } from "../text/Text";

export interface Article {
  write(text: Text): Article;
}