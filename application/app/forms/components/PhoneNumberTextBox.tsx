import { createElement, CSSProperties } from "react";
import { Question, ElementFactory, Serializer } from "survey-core";
import {
  SurveyQuestionElementBase,
  ReactQuestionFactory,
} from "survey-react-ui";
import IntlTelInput from "intl-tel-input/react";
import "intl-tel-input/styles";

export const PHONE_NUMBER_QUESTION_TYPE = "phone-number";
export const PHONE_NUMBER_QUESTION_VALIDITY_PROPERTY = "valid";

export class PhoneNumberTextBoxModel extends Question {
  getType() {
    return PHONE_NUMBER_QUESTION_TYPE;
  }
}

export function registerPhoneNumberTextBox() {
  ElementFactory.Instance.registerElement(
    PHONE_NUMBER_QUESTION_TYPE,
    (name) => {
      return new PhoneNumberTextBoxModel(name);
    },
  );

  ReactQuestionFactory.Instance.registerQuestion(
    PHONE_NUMBER_QUESTION_TYPE,
    (props) => {
      return createElement(PhoneNumberTextBox, props);
    },
  );
}

Serializer.addClass(
  PHONE_NUMBER_QUESTION_TYPE,
  [],
  function () {
    return new PhoneNumberTextBoxModel("");
  },
  "question",
);

export class PhoneNumberTextBox extends SurveyQuestionElementBase {
  constructor(props: any) {
    super(props);
    this.state = { value: this.question.value };
  }

  get question() {
    return this.questionBase;
  }

  get value() {
    return this.question.value;
  }

  handleNumberChange = (phoneNumber) => {
    this.question.value = phoneNumber;
  };

  handleValidityChange = (valid) => {
    this.question.setPropertyValue(
      PHONE_NUMBER_QUESTION_VALIDITY_PROPERTY,
      valid,
    );
  };

  // Support the read-only and design modes
  get style(): CSSProperties {
    return this.question.getPropertyValue("readOnly") ||
      this.question.isDesignMode
      ? { pointerEvents: "none" }
      : undefined;
  }

  renderElement() {
    return (
      <div style={this.style}>
        <IntlTelInput
          initialValue={this.question.value}
          onChangeNumber={this.handleNumberChange}
          onChangeValidity={this.handleValidityChange}
          usePreciseValidation={true}
          initOptions={{
            initialCountry: "auto",
            countryOrder: ["lk", "au", "gb", "de"],
            geoIpLookup: function (success, failure) {
              fetch("https://ipapi.co/json")
                .then(function (res) {
                  return res.json();
                })
                .then(function (data) {
                  success(data.country_code);
                })
                .catch(function () {
                  success("lk");
                });
            },
            utilsScript:
              "https://cdn.jsdelivr.net/npm/intl-tel-input@latest/build/js/utils.js",
            strictMode: true,
          }}
          inputProps={{
            className: "sd-input sd-text",
          }}
        />
      </div>
    );
  }
}
