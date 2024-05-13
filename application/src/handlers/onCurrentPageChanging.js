import identificationPage from "../pages/identification";
import specialCommentsPage from "../pages/specialComments";

const onCurrentPageChanging = (survey, options) => {
  if (
    options.oldCurrentPage.name === identificationPage.name &&
    survey.getPropertyValue("existingYogi") === undefined
  ) {
    options.allowChanging = false;
    survey.setLoading(true);
    setTimeout(() => {
      survey.setLoading(false);
      if (survey.data?.NIC === "1") {
        options.oldCurrentPage.readOnly = true;
        console.log(survey.pages);
        for (let index = 0; index < survey.pages.length; index++) {
          let page = survey.pages[index];
          console.log(page.name);
          if (page.name.indexOf("page") !== -1) {
            page.visible = false;
          }
        }
        survey.setPropertyValue("existingYogi", true);
        survey.currentPage = survey.getPageByName(specialCommentsPage.name);
      } else {
        survey.currentPage = options.newCurrentPage;
      }
    }, 2000);
  }
};

export default onCurrentPageChanging;
