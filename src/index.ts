import { DefaultArticle } from "./article/DefaultArticle";
import { DefaultText } from "./text/DefaultText";

const article = new DefaultArticle();
const updated = article.write(new DefaultText("Olá mundo"));

console.log(updated);