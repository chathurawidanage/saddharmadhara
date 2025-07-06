import showdown from "showdown";
import { RETREAT_CHECKBOX_ITEM_NAME } from "../components/RetreatCheckboxItem";
import { SurveyModel } from "survey-core";

const converter = new showdown.Converter();
const onTextMarkdown = (survey: SurveyModel, options) => {
  if (options?.element?.jsonObj?.itemComponent === RETREAT_CHECKBOX_ITEM_NAME) {
    // Convert Markdown to HTML
    // Remove root paragraphs <p></p>
    // str = str.substring(3);
    // str = str.substring(0, str.length - 4);
    // Set HTML markup to render
    options.html = converter.makeHtml(options.text);
  }
};

export default onTextMarkdown;
