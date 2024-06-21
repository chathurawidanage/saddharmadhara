import { Converter } from "showdown";
import { RETREAT_CHECKBOX_ITEM_NAME } from "../components/RetreatCheckboxItem";
const converter = new Converter();
const onTextMarkdown = (survey, options) => {
    if (options.element.jsonObj.itemComponent === RETREAT_CHECKBOX_ITEM_NAME) {
        // Convert Markdown to HTML
        let str = converter.makeHtml(options.text);
        console.log(str, options);
        // Remove root paragraphs <p></p>
        // str = str.substring(3);
        // str = str.substring(0, str.length - 4);
        // Set HTML markup to render
        options.html = str;
    }
};

export default onTextMarkdown;