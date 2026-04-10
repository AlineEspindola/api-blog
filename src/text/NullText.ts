import { Text } from "./Text";

export class NullText implements Text {
  value(): string {
    return "";
  }
}