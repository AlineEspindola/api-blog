import { Text } from "./Text";

export class NullText implements Text {
  getValue(): string {
    return "";
  }
}