import { SurveyModel } from "survey-core";
import { uploadFile } from "../../../backend/Dhis2Client";

const onUploadFiles = (survey: SurveyModel, options) => {
  const formData = new FormData();
  for (let file of options.files) {
    if (file?.type?.indexOf("image/") < 0) {
      options.callback(
        [],
        ["Unsupported file type. Only images are supported."],
      );
      return;
    }
    formData.append("file", file);
  }

  uploadFile(formData)
    .then((fileId) => {
      options.callback(
        options.files.map((file) => {
          return {
            file: file,
            content: fileId,
          };
        }),
      );
    })
    .catch((error) => {
      console.error("File upload Error: ", error);
      options.callback([], ["An error occurred during file upload."]);
    });
};

export default onUploadFiles;
