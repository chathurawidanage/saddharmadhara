"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Model, surveyLocalization } from "survey-core";
import "survey-core/defaultV2.min.css";
import { Survey } from "survey-react-ui";
import englishLocaleStrings, { ENGLISH_LOCALE } from "./locale/english";
import sinhalaLocaleStrings, { SINHALA_LOCALE } from "./locale/sinhala";
import languagePage from "./pages/language";
import onValueChanged from "./handlers/onValueChanged";
import onUploadFiles from "./handlers/onUploadFiles";
import onComplete from "./handlers/onComplete";
import Loader from "./components/Loader";
import onCurrentPageChanging from "./handlers/onCurrentPageChanging";
import onPropertyChanged from "./handlers/onPropertyChanged";
import onValidateQuestion from "./handlers/onValidateQuestion";
import onTextMarkdown from "./handlers/onTextMarkdown";
import "./App.css";

surveyLocalization.locales[SINHALA_LOCALE] = sinhalaLocaleStrings;
surveyLocalization.locales[ENGLISH_LOCALE] = englishLocaleStrings;

const surveyJson = {
  title: {
    [ENGLISH_LOCALE]: "🪷 Saddharmadhara Application",
    [SINHALA_LOCALE]: "🪷 සද්ධර්මධාරා අයදුම්පත්‍රය",
  },
  showPreviewBeforeComplete: "showAnsweredQuestions",
  showTOC: true,
  completedHtml: {
    [ENGLISH_LOCALE]: "<h4>Thank you for applying to Saddharmadhara!</h4>",
    [SINHALA_LOCALE]: "<h4>සද්ධර්මධාරා සඳහා අයදුම් කළ ඔබට ස්තුතියි!</h4>",
  },
  pages: [languagePage],
};

export default function Confirm({ teiId }: { teiId: string }) {
  const survey = useMemo(() => new Model(surveyJson), []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    survey.locale = SINHALA_LOCALE;
    // attach setLoading as a property of survey
    survey.setLoading = setLoading;
  }, [survey]);

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
