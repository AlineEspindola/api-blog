import { Text } from "./Text";

export class DefaultText implements Text {
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  value(): string {
    return this.text;
  }
 
}
