import { Text } from "../text/Text";

export class Email implements Text {
  private address: Text;

  constructor(address: Text) {
    this.address = address;
  }

  getValue(): string {
    if (!this.address.getValue().includes("@")) {
      throw new Error("Email inválido");
    }
    return this.address.getValue();
  }
}
