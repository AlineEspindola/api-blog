import { Article } from "../article/Article";
import { DefaultArticle } from "../article/DefaultArticle";
import { Email } from "../text/Email";
import { Person } from "./Person";

export class Author implements Person {
  private name: Text
  private email: Email;

  constructor(name: Text, email: Email) {
    this.name = name;
    this.email = email;
  }

  getName(): Text {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  createArticle(): Article {
    return new DefaultArticle();
  }
}
