"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Model, surveyLocalization } from "survey-core";
import "survey-core/defaultV2.min.css";
import { ReactElementFactory, Survey } from "survey-react-ui";
import {
  getRetreatByCode,
  isAcceptingApplications
} from "../../backend/Dhis2Client";
import "./App.css";
import Loader from "./components/Loader";
import { registerPhoneNumberTextBox } from "./components/PhoneNumberTextBox";
import RetreatCheckboxItem, {
  RETREAT_CHECKBOX_ITEM_NAME,
} from "./components/RetreatCheckboxItem";
import ProgramClosed from "./components/ProgramClosed";
import MaintenanceMode from "./components/MaintenanceMode";
import onComplete from "./handlers/onComplete";
import onCurrentPageChanging from "./handlers/onCurrentPageChanging";
import onPropertyChanged from "./handlers/onPropertyChanged";
import onTextMarkdown from "./handlers/onTextMarkdown";
import onUploadFiles from "./handlers/onUploadFiles";
import onValidateQuestion from "./handlers/onValidateQuestion";
import onValueChanged from "./handlers/onValueChanged";
import englishLocaleStrings, { ENGLISH_LOCALE } from "./locale/english";
import sinhalaLocaleStrings, { SINHALA_LOCALE } from "./locale/sinhala";
import agreementPage from "./pages/agreement";
import emergencyContactPage from "./pages/emergency";
import identificationPage from "./pages/identification";
import instructionsPage from "./pages/instructions";
import languagePage from "./pages/language";
import personalPage from "./pages/personal";
import preparationsPage from "./pages/preparations";
import readinessCheckPage from "./pages/readinessCheck";
import retreatsPage from "./pages/retreats";
import specialCommentsPage from "./pages/specialComments";
import spiritualPursuitsPage from "./pages/spiritualPursuits";
import { SPECIF_RETREAT_REQUESTED, SURVEY_TIME_LIMIT_SECONDS } from "./properties";
import { DHIS2_RETREAT_ATTRIBUTE_DATE, DHIS2_RETREAT_ATTRIBUTE_DISABLED } from "./dhis2";
import ErrorComponent, { ErrorComponentProps } from "./components/ErrorComponent";
import { DHIS2_RETREAT_ATTRIBUTE_MEDIUM } from "./dhis2";

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

interface ApplicationProps {
  retreat?: string;
}

export default function Application({ retreat }: ApplicationProps) {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const survey = useMemo(() => new Model(surveyJson), []);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(undefined);
  const [requestedRetreatError, setRequestedRetreatError] = useState<ErrorComponentProps>(undefined);
  const [validatingRetreat, setValidatingRetreat] = useState(!!retreat);

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
    (async () => {
      survey.locale = SINHALA_LOCALE;

      if (retreat) {
        try {
          const retreatObject = await getRetreatByCode(retreat);
          if (retreatObject) {
            const retreatDisabled = retreatObject.attributes[DHIS2_RETREAT_ATTRIBUTE_DISABLED];
            const retreatDate = retreatObject.attributes[DHIS2_RETREAT_ATTRIBUTE_DATE];
            const retreatLanguage = retreatObject.attributes[DHIS2_RETREAT_ATTRIBUTE_MEDIUM];

            if (retreatDisabled === "true" || new Date(retreatDate).getTime() < Date.now()) {
              setRequestedRetreatError({
                title: {
                  [ENGLISH_LOCALE]: "Applications Disabled",
                  [SINHALA_LOCALE]: "අයදුම්පත් භාරගැනීම නවත්වා ඇත",
                },
                error: {
                  [ENGLISH_LOCALE]: `${retreatObject.text} retreat has been disabled and is not accepting applications anymore.`,
                  [SINHALA_LOCALE]: `${retreatObject.text} වැඩසටහන සඳහා අයදුම්පත් භාරගැනීම නවත්වා ඇත.`,
                },
                language: retreatLanguage,
              });
            } else {
              survey.setPropertyValue(SPECIF_RETREAT_REQUESTED, retreatObject.value);
            }
          } else {
            setRequestedRetreatError({
              title: {
                [ENGLISH_LOCALE]: "Invalid Link",
                [SINHALA_LOCALE]: "වලංගු නොවන සබැඳියකි",
              },
              error: {
                [ENGLISH_LOCALE]: "The link you clicked is invalid or expired.",
                [SINHALA_LOCALE]: "කල් ඉකුත්වූ හෝ වලංගු නොවන සබැඳියකි.",
              },
            });
          }
        } catch (e) {
          console.error("Error validating retreat", e);
        } finally {
          setValidatingRetreat(false);
        }
      }

      // attach setLoading as a property of survey
      survey.setLoading = setLoading;
    })();
  }, [survey, retreat]);

  return (
    <div className="App">
      {isMaintenanceMode ? (
        <MaintenanceMode />
      ) : (
        <>
          <Loader visible={loading || validatingRetreat || accepting === undefined} />
      {requestedRetreatError && (
        <ErrorComponent
          title={requestedRetreatError.title}
          error={requestedRetreatError.error}
          language={requestedRetreatError.language}
        />
      )}
      {!requestedRetreatError && accepting === true && !loading && !validatingRetreat && (
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
      {!requestedRetreatError && accepting === false && <ProgramClosed />}
        </>
      )}
    </div>
  );
}
