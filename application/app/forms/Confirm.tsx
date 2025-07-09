"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Model, surveyLocalization } from "survey-core";
import "survey-core/defaultV2.min.css";
import { Survey } from "survey-react-ui";
import englishLocaleStrings, { ENGLISH_LOCALE } from "./locale/english";
import sinhalaLocaleStrings, { SINHALA_LOCALE } from "./locale/sinhala";
import onValueChanged from "./handlers/onValueChanged";
import onUploadFiles from "./handlers/onUploadFiles";
import onComplete from "./handlers/onComplete";
import Loader from "./components/Loader";
import onCurrentPageChanging from "./handlers/onCurrentPageChanging";
import onPropertyChanged from "./handlers/onPropertyChanged";
import onValidateQuestion from "./handlers/onValidateQuestion";
import onTextMarkdown from "./handlers/onTextMarkdown";
import "./App.css";
import attendance from "./pages/attendance";
import { DHIS2_RETREAT_ATTRIBUTE_MEDIUM } from "./dhis2";

surveyLocalization.locales[SINHALA_LOCALE] = {
  ...sinhalaLocaleStrings,
  completeText: "සනාත කරන්න",
};
surveyLocalization.locales[ENGLISH_LOCALE] = englishLocaleStrings;

const surveyJson = {
  title: {
    [ENGLISH_LOCALE]: "🪷 Saddharmadhara Attendance Confirmation",
    [SINHALA_LOCALE]: "🪷 සද්ධර්මධාරා පැමිණීම තහවුරු කිරීම",
  },
  // showTOC: true,
  completedHtml: {
    [ENGLISH_LOCALE]: "<h4>Thank you for applying to Saddharmadhara!</h4>",
    [SINHALA_LOCALE]: "<h4>සද්ධර්මධාරා සඳහා අයදුම් කළ ඔබට ස්තුතියි!</h4>",
  },
  pages: [],
};

export default function Confirm({
  expressionOfInterestEvent,
  retreatObj,
}: {
  expressionOfInterestEvent: any;
  retreatObj: any;
}) {
  const survey = useMemo(
    () =>
      new Model({
        ...surveyJson,
        pages: [...surveyJson.pages, attendance(retreatObj)],
      }),
    [expressionOfInterestEvent, retreatObj],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let medium = retreatObj.attributes[DHIS2_RETREAT_ATTRIBUTE_MEDIUM];
    survey.locale = medium === "english" ? ENGLISH_LOCALE : SINHALA_LOCALE;
    // attach setLoading as a property of survey
    survey.setLoading = setLoading;
  }, [survey, retreatObj]);

  return (
    <div className="App">
      <Loader visible={loading} />
      <Survey
        model={survey}
        onValueChanged={onValueChanged}
        onUploadFiles={onUploadFiles}
        onComplete={onComplete}
        onCurrentPageChanging={onCurrentPageChanging}
        onPropertyChanged={onPropertyChanged}
        onValidateQuestion={onValidateQuestion}
        onTextMarkdown={onTextMarkdown}
      />
    </div>
  );
}
