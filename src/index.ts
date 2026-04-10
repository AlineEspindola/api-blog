import { DefaultArticle } from "./article/DefaultArticle";
import { DefaultText } from "./text/DefaultText";

const article = new DefaultArticle();
const articleWithText = article.write(new DefaultText("Olá mundo"));
const articleWithTitle = articleWithText.writeTitle(new DefaultText("Titulo do artigo"));

console.log(articleWithText.getText().getValue());
console.log(articleWithTitle.getTitle().getValue());