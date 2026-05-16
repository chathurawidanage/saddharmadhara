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
  NoticeBox,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE } from "../dhis2";
import { useAlert } from "@dhis2/app-runtime";
import { useStore } from "../stores/StoreProvider";
import "./RetreatFinaliseModal.css";
import { Retreat, Yogi } from "../types/domain";

interface RetreatFinaliseModalProps {
  retreat: Retreat;
  onCancel: () => void;
}

const RetreatFinaliseModal = observer(({ retreat, onCancel }: RetreatFinaliseModalProps) => {
  const store = useStore();

  const [check, setChecks] = useState([false, false, false, false]);

  const [loading, setLoading] = useState(false);

  const [selectedYogiList, setSelectedYogiList] = useState<Yogi[]>([]);

  const [alreadyMarkedCount, setAlreadyMarkedCount] = useState(0);

  const [isMarking, setIsMarking] = useState(false);
  const [markedCount, setMarkedCount] = useState(0);
  const { show } = useAlert("Retreat Finalized", {
    duration: 3000,
    success: true,
  });

  useEffect(() => {
    (async () => {
      if (!store.yogis) return;
      setLoading(true);
      const yogis = await store.yogis.fetchYogiBatch(
        retreat.code,
        retreat.name,
        () => {},
      );

      let alreadyMarkedCount = 0;

      const selectedYogis = yogis.filter((yogi) => {
        if (yogi.participation[retreat.code]?.attendance) {
          alreadyMarkedCount++;
        }
        return (
          yogi.expressionOfInterests[retreat.code] &&
          yogi.expressionOfInterests[retreat.code].state ===
            DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE
        );
      });

      setSelectedYogiList(selectedYogis);
      setAlreadyMarkedCount(alreadyMarkedCount);
      setLoading(false);
    })();
  }, [retreat, store.yogis]);

  const onFinaliseClicked = async () => {
    if (!store.yogis || !store.metadata) return;
    setIsMarking(true);
    let markedCount = 0;
    for (const yogi of selectedYogiList) {
      if (!yogi.participation[retreat.code]?.attendance) {
        await store.yogis.markAttendance(yogi.id, retreat, "attended");
        setMarkedCount(++markedCount);
      }
    }
    await store.metadata.markRetreatAsFinalized(retreat);
    setIsMarking(false);
    show();
    onCancel();
  };

  const onCheckChange = (index: number) => {
    const newChecks = [...check];
    newChecks[index] = !newChecks[index];
    setChecks(newChecks);
  };

  return (
    <Modal>
      <ModalTitle>Finalise Retreat</ModalTitle>
      {loading && <CircularLoader />}
      {!loading && (
        <>
          <ModalContent>
            {store.yogis?.requestStates.batchErrors[retreat.code] && (
              <NoticeBox error title="Some yogi records could not be loaded">
                {store.yogis.requestStates.batchErrors[retreat.code]}
              </NoticeBox>
            )}
            <h6>Please confirm the checklist below to finalize the retreat?</h6>
            <div className="finalise-modal-checkboxes">
              <Checkbox
                label={`This retreat had only ${selectedYogiList.length} selected Yogis`}
                checked={check[0]}
                onChange={() => onCheckChange(0)}
              />
              <Checkbox
                label={`I've already entered the attendance of the ${alreadyMarkedCount} yogis who require special comments or have a status other than 'attended'`}
                checked={check[1]}
                onChange={() => onCheckChange(1)}
              />
              <Checkbox
                label={`I understand all remaining ${selectedYogiList.length - alreadyMarkedCount} yogis will be marked as attended upon the completion of this action.`}
                checked={check[2]}
                onChange={() => onCheckChange(2)}
              />
              <Checkbox
                label="I understand this action will be very difficult to undo."
                checked={check[3]}
                onChange={() => onCheckChange(3)}
              />
            </div>
          </ModalContent>
          <ModalActions>
            <ButtonStrip>
              <Button onClick={onCancel}>Cancel</Button>
              <Button
                destructive
                disabled={check.some((check) => !check)}
                onClick={onFinaliseClicked}
                loading={isMarking}
              >
                Finalise
              </Button>
            </ButtonStrip>
            {isMarking && selectedYogiList.length > 0 && (
              <LinearLoader
                width="100%"
                amount={(markedCount * 100) / selectedYogiList.length}
              />
            )}
          </ModalActions>
        </>
      )}
    </Modal>
  );
});

export default RetreatFinaliseModal;
