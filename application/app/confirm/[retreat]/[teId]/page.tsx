import Confirm from "../../../forms/Confirm";
import {
  getExpressionOfInterestEvent,
  getRetreatByCode,
} from "../../../../backend/Dhis2Client";
import ConfirmError from "../../../forms/ConfirmError";
import { ENGLISH_LOCALE } from "../../../forms/locale/english";
import { SINHALA_LOCALE } from "../../../forms/locale/sinhala";
import {
  DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
  DHIS2_TEI_ATTRIBUTE_NAME,
  dhis2Endpoint,
  dhis2Token,
} from "../../../../dhis2Constants";
import { DHIS2_RETREAT_ATTRIBUTE_MEDIUM } from "../../../forms/dhis2";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saddharmadhara Confirmation",
  description:
    "Confirmation for Saddharmadhara meditation programs by Ven. Bambalapitiya Gnanaloka Thero.",
};

const LinkError = ({ language }: { language?: string }) => {
  return (
    <ConfirmError
      title={{
        [ENGLISH_LOCALE]: "Error",
        [SINHALA_LOCALE]: "දෝෂයක් ඇති විය.",
      }}
      error={{
        [ENGLISH_LOCALE]: "There's an error in the link",
        [SINHALA_LOCALE]: "ඔබ භාවිතා කළ සබැඳියෙහි දෝෂයක් තිබේ.",
      }}
      language={language}
    />
  );
};

export default async function Page(props: {
  params: Promise<{
    teId: string;
    retreat: string;
  }>;
}) {
  const { teId, retreat } = await props.params;

  const retreatObj = await getRetreatByCode(retreat);

  if (!retreatObj || !retreatObj.value) {
    return <LinkError />;
  }
  const retreatLanguage = retreatObj.attributes[DHIS2_RETREAT_ATTRIBUTE_MEDIUM];

  console.log(retreatLanguage);

  const expressionOfInterestEvent = await getExpressionOfInterestEvent(
    teId,
    retreatObj.value,
  );

  if (!expressionOfInterestEvent) {
    return <LinkError language={retreatLanguage} />;
  }

  const teiName = await getTeiNameById(teId);

  const currentConfirmationState = expressionOfInterestEvent.dataValues.find(
    (e) => e.dataElement === DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
  )?.value;

  if (!currentConfirmationState) {
    return <LinkError language={retreatLanguage} />;
  }

  if (currentConfirmationState !== "pending") {
    let title = {
      [ENGLISH_LOCALE]: "We have already received your confirmation",
      [SINHALA_LOCALE]: "ඔබගේ තහවුරු කිරීම අපට දැනටමත් ලැබී ඇත",
    };
    let errorMessage = {
      [ENGLISH_LOCALE]: `You (${teiName}) have already sent us you confirmation for this retreat as <b>${currentConfirmationState === "selected" ? "Attending" : "Not Attending"}</b>.`,
      [SINHALA_LOCALE]: `මෙම වැඩසටහන සඳහා ඔබ (${teiName}) දැනටමත් ඔබගේ තහවුරු කිරීම <b>${currentConfirmationState === "selected" ? "පැමිණේ" : "නොපැමිණේ"}</b> ලෙස අපට සනාථ කර ඇත.`,
    };

    if (
      !(
        currentConfirmationState === "selected" ||
        currentConfirmationState === "unattending"
      )
    ) {
      // empty for all other states
      errorMessage = {
        [ENGLISH_LOCALE]: ``,
        [SINHALA_LOCALE]: ``,
      };

      title = {
        [ENGLISH_LOCALE]: `Link Expired of Invalid`,
        [SINHALA_LOCALE]: `කල් ඉකුත්වූ හෝ වලංගු නොවන සබැඳියකි`,
      };
    }

    return (
      <ConfirmError
        title={title}
        error={errorMessage}
        language={retreatLanguage}
      />
    );
  }

  return (
    <Confirm
      expressionOfInterestEvent={expressionOfInterestEvent}
      retreatObj={retreatObj}
      teiName={teiName}
    />
  );
}

async function getTeiNameById(teiId: string) {
  let url = new URL("tracker/trackedEntities/" + teiId, dhis2Endpoint);
  url.searchParams.set("fields", "attributes");
  let response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  });
  let responseJson = await response.json();
  return responseJson.attributes?.find(
    (att) => att.attribute === DHIS2_TEI_ATTRIBUTE_NAME,
  )?.value;
}
