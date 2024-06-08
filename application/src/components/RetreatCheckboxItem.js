import {
  SurveyQuestionCheckboxItem,
} from "survey-react-ui";

export const RETREAT_CHECKBOX_ITEM_NAME = "retreat-checkbox-item";

// todo this custom rendering is not required yet. but keeping this here
// if the checkbox item needs to be customized later.
class RetreatCheckboxItem extends SurveyQuestionCheckboxItem {
  renderElement() {
    console.log(this);
    return super.renderElement();
  }
}

export default RetreatCheckboxItem;
