import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const errorPage = (
  title: {
    [ENGLISH_LOCALE]: String;
    [SINHALA_LOCALE]: String;
  },
  error: {
    [ENGLISH_LOCALE]: String;
  },
) => {
  return {
    name: "Error",
    title: {
      [ENGLISH_LOCALE]: title[ENGLISH_LOCALE],
      [SINHALA_LOCALE]: title[SINHALA_LOCALE],
    },
    elements: [
      {
        name: "Error",
        type: "html",
        html: {
          [ENGLISH_LOCALE]: `
            <p>${error[ENGLISH_LOCALE]}</p>
            <p>If you need further assistance, feel free to message us via SMS or WhatsApp at 0743208734.</p>
          `,
          [SINHALA_LOCALE]: `
            <p>${error[SINHALA_LOCALE]}</p>
            <p>ඔබට වැඩිදුර සහාය අවශ්‍ය නම්, 0743208734 අංකයට SMS හෝ WhatsApp හරහා අපට පණිවිඩයක් එවන්න.</p>
          `,
        },
      },
    ],
  };
};
export default errorPage;
