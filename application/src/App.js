import { useEffect, useMemo, useState } from "react";
import { Model, surveyLocalization } from "survey-core";
import "survey-core/defaultV2.min.css";
import { Survey } from "survey-react-ui";
import "./App.css";
import englishLocaleStrings, { ENGLISH_LOCALE } from "./locale/english";
import sinhalaLocaleStrings, { SINHALA_LOCALE } from "./locale/sinhala";
import agreementPage from "./pages/agreement";
import emergenecyContactPage from "./pages/emergenecy";
import identificationPage from "./pages/identification";
import instructionsPage from "./pages/instructions";
import languagePage from "./pages/language";
import personalPage from "./pages/personal";
import specialCommentsPage from "./pages/specialComments";
import spiritualPursuitsPage from "./pages/spiritualPursuits";
import preperationsPage from "./pages/preperations";
import readynessCheckPage from "./pages/readynessCheck";
import onValueChanged from "./handlers/onValueChanged";
import onUploadFiles from "./handlers/onUploadFiles";
import onComplete from "./handlers/onComplete";
import Loader from "./components/Loader";
import onCurrentPageChanging from "./handlers/onCurrentPageChanging";

// todo validate NIC, Passport

surveyLocalization.locales[SINHALA_LOCALE] = sinhalaLocaleStrings;
surveyLocalization.locales[ENGLISH_LOCALE] = englishLocaleStrings;

const isRequired = false; // set required fields on or off for testing purposes

const surveyJson = {
  title: {
    [ENGLISH_LOCALE]: "🪷 Saddharmadhara Application",
    [SINHALA_LOCALE]: "🪷 සද්ධර්මධාරා අයදුම්පත්‍රය",
  },
  showProgressBar: "top",
  showPreviewBeforeComplete: "showAnsweredQuestions",
  checkErrorsMode: "onValueChanged",
  showTOC: true,
  completedHtml: {
    [ENGLISH_LOCALE]: "<h4>Thank you for applying to Saddharmadhara!</h4>",
    [SINHALA_LOCALE]: "<h4>සද්ධර්මධාරා සඳහා අයදුම් කළ ඔ​බ​ට ස්තුතියි!</h4>",
  },
  pages: [
    languagePage,
    instructionsPage,
    identificationPage,
    personalPage(isRequired),
    emergenecyContactPage(isRequired),
    spiritualPursuitsPage(isRequired),
    readynessCheckPage,
    preperationsPage,
    specialCommentsPage,
    agreementPage,
  ],
};

function App() {
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
      />
    </div>
  );
}

export default App;
