import { FILE_UPLOAD_URL } from "../dhis2";

const onUploadFiles = (survey, options) => {
  const formData = new FormData();
  for (let file of options.files) {
    if (file?.type?.indexOf("image/") < 0) {
      options.callback(
        [],
        ["Unsupported file type. Only images are supported."]
      );
      return;
    }
    formData.append("file", file);
  }

  fetch(FILE_UPLOAD_URL, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data?.httpStatusCode !== 202) {
        throw new Error("Failed to upload the file");
      }
      options.callback(
        options.files.map((file) => {
          return {
            file: file,
            content: data?.response?.fileResource?.id,
          };
        })
      );
    })
    .catch((error) => {
      console.error("File upload Error: ", error);
      options.callback([], ["An error occurred during file upload."]);
    });
};

export default onUploadFiles;
