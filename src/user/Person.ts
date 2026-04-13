import { Email } from "../text/Email";
import { Text } from "../text/Text";
import { Article } from "../article/Article";
import { DraftArticle } from "../article/DraftArticle";
export interface Person {
  getName(): Text;

  getEmail(): Email;

  comment(message: Text, article: Article): Article;

  draftArticle(article: Article): Article;

  editArticle(article: Article, title?: Text, content?: Text): Article;

  publishArticle(article: Article): Article;

  archiveArticle(article: Article): Article;
}
