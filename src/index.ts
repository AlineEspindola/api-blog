import { DefaultArticle } from "./article/DefaultArticle";
import { DefaultText } from "./text/DefaultText";
import { MaxText } from "./text/MaxText";

const article = new DefaultArticle();
const articleWithText = article.write(new MaxText(new DefaultText("Olá mundo"), 1));
const articleWithTitle = articleWithText.writeTitle(new DefaultText("Titulo do artigo"));

console.log(articleWithText.getText().getValue());
console.log(articleWithTitle.getTitle().getValue());