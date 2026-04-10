import { Text } from "./Text";

export class MinText implements Text {
  private text: Text;
  private limit: number;

  constructor(text: Text, limit: number) {
    this.text = text;
    this.limit = limit;
  }

  getValue(): string {
    if (this.text.getValue().length < this.limit) {
      throw new Error(`Texto não atinge o mínimo de ${this.limit} caracteres`);
    }

    return this.text.getValue();
  }
}
