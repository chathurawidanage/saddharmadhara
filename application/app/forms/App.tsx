"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Model, surveyLocalization } from "survey-core";
import "survey-core/defaultV2.min.css";
import { ReactElementFactory, Survey } from "survey-react-ui";
import englishLocaleStrings, { ENGLISH_LOCALE } from "./locale/english";
import sinhalaLocaleStrings, { SINHALA_LOCALE } from "./locale/sinhala";
import agreementPage from "./pages/agreement";
import emergencyContactPage from "./pages/emergency";
import identificationPage from "./pages/identification";
import instructionsPage from "./pages/instructions";
import languagePage from "./pages/language";
import personalPage from "./pages/personal";
import specialCommentsPage from "./pages/specialComments";
import spiritualPursuitsPage from "./pages/spiritualPursuits";
import preparationsPage from "./pages/preparations";
import readinessCheckPage from "./pages/readinessCheck";
import onValueChanged from "./handlers/onValueChanged";
import onUploadFiles from "./handlers/onUploadFiles";
import onComplete from "./handlers/onComplete";
import Loader from "./components/Loader";
import onCurrentPageChanging from "./handlers/onCurrentPageChanging";
import onPropertyChanged from "./handlers/onPropertyChanged";
import retreatsPage from "./pages/retreats";
import RetreatCheckboxItem, {
  RETREAT_CHECKBOX_ITEM_NAME,
} from "./components/RetreatCheckboxItem";
import { SURVEY_TIME_LIMIT_SECONDS } from "./properties";
import { registerPhoneNumberTextBox } from "./components/PhoneNumberTextBox";
import onValidateQuestion from "./handlers/onValidateQuestion";
import onTextMarkdown from "./handlers/onTextMarkdown";
import { isAcceptingApplications } from "../../backend/Dhis2Client";
import "./App.css";
import Image from "next/image";

registerPhoneNumberTextBox();

ReactElementFactory.Instance.registerElement(
  RETREAT_CHECKBOX_ITEM_NAME,
  (props) => {
    return React.createElement(RetreatCheckboxItem, props);
  },
);

surveyLocalization.locales[SINHALA_LOCALE] = sinhalaLocaleStrings;
surveyLocalization.locales[ENGLISH_LOCALE] = englishLocaleStrings;

const isRequired = true; // set required fields on or off for testing purposes

const surveyJson = {
  title: {
    [ENGLISH_LOCALE]: "🪷 Saddharmadhara Application",
    [SINHALA_LOCALE]: "🪷 සද්ධර්මධාරා අයදුම්පත්‍රය",
  },
  showTimerPanel: "top",
  maxTimeToFinish: SURVEY_TIME_LIMIT_SECONDS,
  showProgressBar: "top",
  showPreviewBeforeComplete: "showAnsweredQuestions",
  showTOC: true,
  completedHtml: {
    [ENGLISH_LOCALE]: "<h4>Thank you for applying to Saddharmadhara!</h4>",
    [SINHALA_LOCALE]: "<h4>සද්ධර්මධාරා සඳහා අයදුම් කළ ඔබට ස්තුතියි!</h4>",
  },
  pages: [
    languagePage,
    instructionsPage,
    identificationPage,
    personalPage(isRequired),
    emergencyContactPage(isRequired),
    spiritualPursuitsPage(isRequired),
    readinessCheckPage(isRequired),
    preparationsPage(isRequired),
    specialCommentsPage,
    retreatsPage,
    agreementPage,
  ],
};

export default function Application() {
  const survey = useMemo(() => new Model(surveyJson), []);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(undefined);

  useEffect(() => {
    isAcceptingApplications()
      .then((accepting) => {
        setAccepting(accepting);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    survey.locale = SINHALA_LOCALE;
    // attach setLoading as a property of survey
    survey.setLoading = setLoading;
  }, [survey]);

  return (
    <div className="App">
      <Loader visible={loading || accepting === undefined} />
      {accepting === true && (
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
      )}
      {accepting === false && (
        <div className="program-closed">
          <div>
            <Image src="/favicon.png" alt="logo" width={100} />
            <h1>සද්ධර්මධාරා - Saddharmadhara</h1>
            <h2>
              සැලසුම් කළ සද්ධර්මධාරා භාවනා වැඩසටහන් අවසන් වූ බැවින් ඒ සදහා
              ලියාපදිංචි වීම තාවකාලිකව නවතා ඇත.
            </h2>
            <h2>
              Registration for the planned Saddharmadhara meditation programs
              has been temporarily paused for the current season, as the
              programs have now concluded.
            </h2>
          </div>
          <div>
            <p>
              මෙතෙක් පැවති වැඩසටහන් නැරඹීමට අපගේ Youtube නාලිකාව හා සම්බන්ධ
              වන්න.
            </p>
            <p>Join our YouTube channel to watch the previous programs</p>
            <a
              href="https://www.youtube.com/channel/UCXFiIVHYqQmgpmIi7KChMkQ"
              target="_blank"
              className="youtube-btn"
            >
              Youtube
            </a>
          </div>
          <div>
            <p>
              ඉදරි වැඩසටහන් පිළිබඳව දැනුවත් වීමට අපගේ Whatsapp සමූහයට එක් වන්න.
            </p>
            <p>
              Join our Whatsapp group to stay informed about upcoming programs
            </p>
            <a
              href="https://srisambuddhamission.org/whatsapp"
              target="_blank"
              className="whatsapp-btn"
            >
              Whatsapp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
