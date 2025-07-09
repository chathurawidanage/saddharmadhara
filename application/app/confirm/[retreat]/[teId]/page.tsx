import Confirm from "../../../forms/Confirm";
import {
  getExpressionOfInterestEvent,
  getRetreatByCode,
} from "../../../../backend/Dhis2Client";

export default async function Page(props: {
  params: Promise<{
    teId: string;
    retreat: string;
  }>;
}) {
  const { teId, retreat } = await props.params;

  const retreatObj = await getRetreatByCode(retreat);
  const expressionOfInterestEvent = await getExpressionOfInterestEvent(
    teId,
    retreatObj.code,
  );

  return (
    <Confirm
      expressionOfInterestEvent={expressionOfInterestEvent}
      retreatObj={retreatObj}
    />
  );
}
