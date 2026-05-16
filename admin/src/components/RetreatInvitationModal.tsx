import { useAlert, useDataEngine } from "@dhis2/app-runtime";
import {
  Button,
  ButtonStrip,
  CalendarInput,
  CircularLoader,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  NoticeBox,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { sendRetreatInvitations } from "../services/invitationService";
import { useStore } from "../stores/StoreProvider";
import MessagePreview from "./manager/invitation/MessagePreview";
import RecipientSelection from "./manager/invitation/RecipientSelection";
import SendProgress from "./manager/invitation/SendProgress";
import "./RetreatInvitationModal.css";
import { Retreat, Yogi } from "../types/domain";

interface RetreatInvitationModalProps {
  retreat: Retreat;
  onCancel: () => void;
}

const RetreatInvitationModal = observer(({ retreat, onCancel }: RetreatInvitationModalProps) => {
  const store = useStore();
  const dataEngine = useDataEngine();

  const [check, setChecks] = useState([true, true, false]);
  const [confirmationDeadline, setConfirmationDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );

  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [sentYogis, setSentYogis] = useState<Yogi[]>([]);
  const [failedYogis, setFailedYogis] = useState<Yogi[]>([]);
  const [toSendYogis, setToSendYogis] = useState<Yogi[]>([]);

  const [sentCount, setSentCount] = useState(0);
  const [totalToSend, setTotalToSend] = useState(0);

  const { show } = useAlert("Invitations Sent", {
    duration: 3000,
    success: true,
  });

  useEffect(() => {
    (async () => {
      if (!store.yogis) return;
      setLoading(true);
      const noop = () => { /* no progress tracking in this context */ };
      const yogis = await store.yogis.fetchYogiBatch(
        retreat.code,
        retreat.name,
        noop,
      );

      const sentYogisArr: Yogi[] = [];
      const failedYogisArr: Yogi[] = [];
      const toSendYogisArr: Yogi[] = [];

      yogis.forEach((yogi) => {
        if (yogi.expressionOfInterests[retreat.code]?.state !== "PENDING") {
          return;
        }

        const invitationStatus = yogi.expressionOfInterests[retreat.code].invitationSent;
        if (invitationStatus === "SENT" || invitationStatus === "DELIVERED") {
          sentYogisArr.push(yogi);
        } else if (invitationStatus === "FAILED") {
          failedYogisArr.push(yogi);
        } else {
          toSendYogisArr.push(yogi);
        }
      });

      setSentYogis(sentYogisArr);
      setFailedYogis(failedYogisArr);
      setToSendYogis(toSendYogisArr);
      setLoading(false);
    })();
  }, [retreat, store.yogis]);

  const onFinaliseClicked = async () => {
    if (!store.metadata || !store.yogis) return;
    setIsSending(true);

    await store.metadata.setRetreatAttendanceConfirmationDate(
      retreat,
      confirmationDeadline,
    );

    const finalYogisList: Yogi[] = [];
    if (check[0]) finalYogisList.push(...toSendYogis);
    if (check[1]) finalYogisList.push(...failedYogis);
    if (check[2]) finalYogisList.push(...sentYogis);

    setSentCount(0);
    setTotalToSend(finalYogisList.length);

    await sendRetreatInvitations({
      engine: dataEngine,
      retreat,
      confirmationDeadline,
      yogis: finalYogisList.map((yogi) => ({
        id: yogi.id,
        eventId: yogi.expressionOfInterests[retreat.code].eventId,
        fullName: yogi.attributes.fullName || "",
        mobile: yogi.attributes.mobile || "",
      })),
      onResult: async ({ yogiId, sent }: { yogiId: string; sent: boolean }) => {
        await store.yogis?.changeInvitationSentState(
          yogiId,
          retreat.code,
          sent ? "sent" : "failed",
        );
      },
      onProgress: ({ completed }: { completed: number }) => {
        setSentCount(completed);
      },
    });

    setIsSending(false);
    show();
    onCancel();
  };

  const countToSend = (check[0] ? toSendYogis.length : 0) +
                     (check[1] ? failedYogis.length : 0) +
                     (check[2] ? sentYogis.length : 0);

  return (
    <Modal>
      <ModalTitle>Send Invitations</ModalTitle>
      {loading ? (
        <div className="retreat-invitation-modal-loader">
          <CircularLoader />
        </div>
      ) : (
        <>
          <ModalContent>
            {store.yogis?.requestStates.batchErrors[retreat.code] && (
              <NoticeBox error title="Some yogi records could not be loaded">
                {store.yogis.requestStates.batchErrors[retreat.code]}
              </NoticeBox>
            )}
            
            <h6>Please confirm the recipients of the invitations</h6>
            
            <RecipientSelection 
              toSendCount={toSendYogis.length}
              failedCount={failedYogis.length}
              sentCount={sentYogis.length}
              checks={check}
              onCheckChange={(index) => {
                const newChecks = [...check];
                newChecks[index] = !newChecks[index];
                setChecks(newChecks);
              }}
            />

            <div className="retreat-invitation-deadline-section">
              <h6 className="retreat-invitation-deadline-title">Set the confirmation deadline</h6>
              <CalendarInput
                label="Confirmation Deadline"
                calendar="gregory"
                locale="en-LK"
                date={confirmationDeadline}
                onDateSelect={(date: any) => {
                  setConfirmationDeadline(date.calendarDateString);
                }}
              />
            </div>

            <MessagePreview 
              retreat={retreat}
              confirmationDeadline={confirmationDeadline}
            />
          </ModalContent>
          <ModalActions>
            <div className="retreat-invitation-progress-wrapper">
              {isSending && (
                <SendProgress 
                  sentCount={sentCount} 
                  totalToSend={totalToSend} 
                />
              )}
            </div>
            <ButtonStrip>
              <Button onClick={onCancel} disabled={isSending}>Cancel</Button>
              <Button
                destructive
                onClick={onFinaliseClicked}
                loading={isSending}
                disabled={isSending || (countToSend === 0 && !isSending)}
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
