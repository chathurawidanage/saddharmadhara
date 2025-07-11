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
import { DHIS2_TEI_ATTRIBUTE_MOBILE } from "../dhis2";

const classes = {
  checkboxes: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
};

const tokenCreateMutation = {
  type: "create",
  resource: "apiToken",
  data: ({ expire }) => ({
    expire,
    attributes: [{ type: "MethodAllowedList", allowedMethods: ["GET"] }],
  }),
};

async function sendSms(
  teiId,
  retreatCode,
  retreatFrom,
  retreatTo,
  teiMobile,
  token,
) {
  const response = await fetch(
    `https://application.srisambuddhamission.org/api/sms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiToken ${token}`,
      },
      body: JSON.stringify({
        msisdn: [teiMobile],
        // todo send in English for english retreats
        message: `ඔබ 11/08/2025 සිට 17/08/25 දක්වා පැවැත්වෙන සද්ධර්මධාරා
නේවාසික වැඩසටහන හා සම්බන්ධවීමට තේරී පත් ව ඇත. පහත යොමුව මගින් ඔබගේ සහභාගි වීම/නොවීම තහවුරු කරන්න.

https://application.srisambuddhamission.org/confirm/${retreatCode}/${teiId}

එසේ අපහසු නම් පමණක් ඔබගේ සහභාගිත්වය පහත පරිදි 0743208734 අංකයට SMS හෝ Whatsapp පණිවිඩයක් මගින් තහවුරු කරන්න.
වැඩසටහන් අංකය:
නම:
ජා.හැ.අ./ගමන් බ.ප.අ:
පැමිණීම / නොපැමිණීම:`,
      }),
    },
  );
  return response.ok;
}

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
      let yogiList = await store.yogis.fetchExpressionOfInterests(retreat.code);

      const yogiFetchPromises = yogiList.map((yogiId) => {
        return store.yogis.fetchYogi(yogiId);
      });

      const sentYogisArr = [];
      const failedYogisArr = [];
      const toSendYogisArr = [];

      await Promise.all(yogiFetchPromises).then((yogis) => {
        yogis.forEach((yogi) => {
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
  }, [retreat]);

  const onFinaliseClicked = async () => {
    setIsSending(true);

    await store.metadata.setRetreatAttendanceConfirmationDate(
      retreat,
      new Date(confirmationDeadline),
    );

    // create a temporary token
    const tokenResponse = await dataEngine.mutate(tokenCreateMutation, {
      variables: {
        expire: Date.now() + 60 * 60 * 1000,
      },
    });

    const token = tokenResponse?.response.key;
    const tokenId = tokenResponse?.response.uid;

    // send invites to yogis

    if (check[0]) {
      setTotalToSend(toSendYogis.length);
      for (let i = 0; i < toSendYogis.length; i++) {
        await sendSms(
          toSendYogis[i].id,
          retreat.code,
          retreat.date,
          retreat.endDate,
          toSendYogis[i].attributes[DHIS2_TEI_ATTRIBUTE_MOBILE],
          token,
        );
        setSentCount(i + 1);
      }
    }

    // delete the token
    await dataEngine.mutate({
      type: "delete",
      resource: "apiToken",
      id: tokenId,
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
          </ModalContent>
          <ModalContent>
            <h6 style={{ marginTop: 20 }}>Set the confirmation deadline</h6>
            <CalendarInput
              label="Confirmation Deadline"
              calendar="gregory"
              locale="en-LK"
              date={confirmationDeadline}
              onDateSelect={(date) => {
                console.log(date);
                setConfirmationDeadline(date.calendarDateString);
              }}
            />
          </ModalContent>
          <ModalActions>
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
            {isSending && totalToSend > 0 && (
              <LinearLoader
                width="100%"
                amount={(sentCount * 100) / totalToSend}
              />
            )}
          </ModalActions>
        </>
      )}
    </Modal>
  );
});

export default RetreatInvitationModal;
