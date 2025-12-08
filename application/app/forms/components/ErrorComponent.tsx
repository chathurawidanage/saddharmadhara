"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Model, surveyLocalization } from "survey-core";
import "survey-core/defaultV2.min.css";
import { Survey } from "survey-react-ui";
import englishLocaleStrings, { ENGLISH_LOCALE } from "../locale/english";
import sinhalaLocaleStrings, { SINHALA_LOCALE } from "../locale/sinhala";
import Loader from "./Loader";
import "../App.css";
import errorPage from "../pages/error";

surveyLocalization.locales[SINHALA_LOCALE] = {
  ...sinhalaLocaleStrings,
  completeText: "සනාථ කරන්න",
};
surveyLocalization.locales[ENGLISH_LOCALE] = englishLocaleStrings;

const surveyJson = {
  title: {
    [ENGLISH_LOCALE]: "🪷 Saddharmadhara",
    [SINHALA_LOCALE]: "🪷 සද්ධර්මධාරා",
  },
  pages: [],
  showQuestionNumbers: false,
  showNavigationButtons: false,
};

export interface ErrorComponentProps {
  title: {
    [SINHALA_LOCALE]: string;
    [ENGLISH_LOCALE]: string;
  };
  error: {
    [SINHALA_LOCALE]: string | React.ReactNode;
    [ENGLISH_LOCALE]: string | React.ReactNode;
  };
  language?: string;
}

export default function ErrorComponent({
  title,
  error,
  language,
}: ErrorComponentProps) {
  const [loading, setLoading] = useState(false);
  const survey = useMemo(
    () =>
      new Model({
        ...surveyJson,
        pages: [...surveyJson.pages, errorPage(title, error)],
      }),
    [title, error],
  );

  useEffect(() => {
    survey.setLoading = setLoading;
    survey.locale = language === "english" ? ENGLISH_LOCALE : SINHALA_LOCALE;
  }, [survey, language]);

  return (
    <div className="App">
      <Loader visible={loading} />
      <Survey model={survey} />
    </div>
  );
}
