import {
  Button,
  ButtonStrip,
  Checkbox,
  CircularLoader,
  LinearLoader,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  CalendarInput,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useAlert, useDataEngine } from "@dhis2/app-runtime";
import {
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_MOBILE,
} from "../dhis2";
import {
  getInvitationMessage,
  sendRetreatInvitations,
} from "../services/invitationService";

const classes = {
  checkboxes: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
};


const RetreatInvitationModal = observer(({ store, retreat, onCancel }) => {
  const dataEngine = useDataEngine();

  // uninvited, failed, sent
  const [check, setChecks] = React.useState([true, true, false]);
  const [confirmationDeadline, setConfirmationDeadline] = React.useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );

  const [loading, setLoading] = React.useState(false);

  const [isSending, setIsSending] = React.useState(false);

  const [sentYogis, setSentYogis] = React.useState([]);
  const [failedYogis, setFailedYogis] = React.useState([]);
  const [toSendYogis, setToSendYogis] = React.useState([]);

  const [sentCount, setSentCount] = React.useState(0);
  const [totalToSend, setTotalToSend] = React.useState(0);

  const { show } = useAlert("Invitations Sent", {
    duration: 3000,
    success: true,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      let yogiList = await store.yogis.fetchExpressionOfInterests(
        retreat.code,
        retreat.name,
      );

      const yogiFetchPromises = yogiList.map((yogiId) => {
        return store.yogis.fetchYogi(yogiId);
      });

      const sentYogisArr = [];
      const failedYogisArr = [];
      const toSendYogisArr = [];

      await Promise.all(yogiFetchPromises).then((yogis) => {
        yogis.forEach((yogi) => {
          if (yogi.expressionOfInterests[retreat.code].state !== "pending") {
            return;
          }

          if (
            yogi.expressionOfInterests[retreat.code].invitationSent ===
              "sent" ||
            yogi.expressionOfInterests[retreat.code].invitationSent ===
              "delivered"
          ) {
            sentYogisArr.push(yogi);
          } else if (
            yogi.expressionOfInterests[retreat.code].invitationSent === "failed"
          ) {
            failedYogisArr.push(yogi);
          } else {
            toSendYogisArr.push(yogi);
          }
        });
        setSentYogis(sentYogisArr);
        setFailedYogis(failedYogisArr);
        setToSendYogis(toSendYogisArr);
        setLoading(false);
      });
    })();
  }, [retreat, store.yogis]);

  const onFinaliseClicked = async () => {
    setIsSending(true);

    await store.metadata.setRetreatAttendanceConfirmationDate(
      retreat,
      confirmationDeadline,
    );

    const finalYogisList = [];

    if (check[0]) {
      finalYogisList.push(...toSendYogis);
    }

    if (check[1]) {
      finalYogisList.push(...failedYogis);
    }

    if (check[2]) {
      finalYogisList.push(...sentYogis);
    }

    setSentCount(0);
    setTotalToSend(finalYogisList.length);

    await sendRetreatInvitations({
      engine: dataEngine,
      retreat,
      confirmationDeadline,
      yogis: finalYogisList.map((yogi) => ({
        id: yogi.id,
        eventId: yogi.expressionOfInterests[retreat.code].eventId,
        attributes: {
          fullName: yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME],
          mobile: yogi.attributes[DHIS2_TEI_ATTRIBUTE_MOBILE],
        },
      })),
      onResult: async ({ yogiId, sent }) => {
        await store.yogis.changeInvitationSentState(
          yogiId,
          retreat.code,
          sent ? "sent" : "failed",
        );
      },
      onProgress: ({ completed }) => {
        setSentCount(completed);
      },
    });

    setIsSending(false);
    show();
    onCancel();
  };

  const onCheckChange = (index) => {
    const newChecks = [...check];
    newChecks[index] = !newChecks[index];
    setChecks(newChecks);
  };

  return (
    <Modal>
      <ModalTitle>Send Invitations</ModalTitle>
      {loading && <CircularLoader />}
      {!loading && (
        <>
          <ModalContent>
            <h6>Please confirm the recipients of the invitations</h6>
            <div style={classes.checkboxes}>
              <Checkbox
                label={`Send to the ${toSendYogis.length} uninvited yogis`}
                checked={check[0]}
                onChange={() => onCheckChange(0)}
              />
              <Checkbox
                label={`Send to the ${failedYogis.length} yogis with previous invite SMS sending failures`}
                checked={check[1]}
                onChange={() => onCheckChange(1)}
              />
              <Checkbox
                label={`ReSend to the ${sentYogis.length} yogis already invited`}
                checked={check[2]}
                onChange={() => onCheckChange(2)}
              />
            </div>
            <div>
              <h6 style={{ marginTop: 20 }}>Set the confirmation deadline</h6>
              <CalendarInput
                label="Confirmation Deadline"
                calendar="gregory"
                locale="en-LK"
                date={confirmationDeadline}
                onDateSelect={(date) => {
                  setConfirmationDeadline(date.calendarDateString);
                }}
              />
            </div>
            <div>
              <h6 style={{ marginTop: 20 }}>
                Check the correctness of the message below
              </h6>
              <textarea
                disabled={true}
                style={{ width: "100%", height: 350 }}
                value={getInvitationMessage(
                  "yogi-id",
                  "yogi-full-name",
                  retreat.retreatCode,
                  retreat.date,
                  retreat.endDate,
                  confirmationDeadline,
                  retreat.retreatType,
                )}
              />
            </div>
          </ModalContent>
          <ModalActions>
            {isSending && totalToSend > 0 && (
              <LinearLoader amount={(sentCount * 100) / totalToSend} />
            )}
            <ButtonStrip>
              <Button onClick={onCancel}>Cancel</Button>
              <Button
                destructive
                onClick={onFinaliseClicked}
                loading={isSending}
              >
                Send
              </Button>
            </ButtonStrip>
          </ModalActions>
        </>
      )}
    </Modal>
  );
});

export default RetreatInvitationModal;
