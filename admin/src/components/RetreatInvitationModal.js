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
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useAlert, useDataEngine } from "@dhis2/app-runtime";

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

const RetreatInvitationModal = observer(({ store, retreat, onCancel }) => {
  const dataEngine = useDataEngine();

  const [check, setChecks] = React.useState([true, true, false]);

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

    // create a temporary token
    const tokenResponse = await dataEngine.mutate(tokenCreateMutation, {
      variables: {
        expire: Date.now() + 60 * 60 * 1000,
      },
    });

    const token = tokenResponse?.response.key;
    const tokenId = tokenResponse?.response.uid;

    // delete the token
    await dataEngine.mutate({
      type: "delete",
      resource: "apiToken",
      id: tokenId,
    });

    // send invites
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
