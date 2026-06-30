import { useAlert } from "@dhis2/app-runtime";
import {
  Button,
  ButtonStrip,
  LinearLoader,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  NoticeBox,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useState } from "react";
import {
  DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE,
} from "../../dhis2";
import { useStore } from "../../stores/StoreProvider";
import { Retreat, SelectionState, Yogi } from "../../types/domain";

interface BulkMoveModalProps {
  retreat: Retreat;
  fromState: string;
  allYogis: Yogi[];
  onCancel: () => void;
}

const BulkMoveModal = observer(({
  retreat,
  fromState,
  allYogis,
  onCancel,
}: BulkMoveModalProps) => {
  const store = useStore();

  const [isMoving, setIsMoving] = useState(false);
  const [movedCount, setMovedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const { show: showSuccessAlert } = useAlert(
    ({ message }: { message: string }) => message,
    { success: true, duration: 4000 }
  );

  const { show: showErrorAlert } = useAlert(
    ({ message }: { message: string }) => message,
    { critical: true, duration: 5000 }
  );

  // Filter all yogis currently in the source state for this retreat
  const yogisToMove = allYogis.filter(
    (yogi) => yogi.expressionOfInterests[retreat.code]?.state === fromState
  );
  const totalYogis = yogisToMove.length;

  const selectionStates = store.metadata?.selectionStates || [];
  const fromStateObj = selectionStates.find((s) => s.code === fromState);
  const fromStateName = fromStateObj ? fromStateObj.name : fromState;

  const toStateObj = selectionStates.find(
    (s) => s.code === DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE
  );
  const toStateName = toStateObj
    ? toStateObj.name
    : DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE;

  const handleBulkMove = async () => {
    if (!store.yogis) return;
    setIsMoving(true);
    setErrors([]);
    setMovedCount(0);
    setFailedCount(0);
    setFinished(false);

    let completed = 0;
    let failed = 0;
    const errorList: string[] = [];

    for (const yogi of yogisToMove) {
      try {
        const success = await store.yogis.changeRetreatState(
          yogi.id,
          retreat.code,
          DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE as SelectionState
        );

        if (success) {
          completed++;
          setMovedCount(completed);
        } else {
          failed++;
          setFailedCount(failed);
          errorList.push(`Failed to move ${yogi.attributes.fullName || yogi.id}`);
          setErrors([...errorList]);
        }
      } catch (err: any) {
        failed++;
        setFailedCount(failed);
        errorList.push(
          err.message || `An error occurred for ${yogi.attributes.fullName || yogi.id}`
        );
        setErrors([...errorList]);
      }
    }

    setIsMoving(false);
    setFinished(true);

    if (failed === 0) {
      showSuccessAlert({
        message: `Successfully moved ${completed} yogi(s) from '${fromStateName}' to '${toStateName}'.`,
      });
      onCancel();
    } else {
      showErrorAlert({
        message: `Bulk move completed with ${failed} failure(s).`,
      });
    }
  };

  const processedCount = movedCount + failedCount;

  return (
    <Modal onClose={isMoving ? undefined : onCancel}>
      <ModalTitle>Bulk Move to Selected</ModalTitle>
      <ModalContent>
        {totalYogis === 0 ? (
          <NoticeBox warning title="No yogis found">
            There are no yogis currently in the &apos;{fromStateName}&apos; state to move.
          </NoticeBox>
        ) : (
          <div>
            {!isMoving && !finished && (
              <p>
                Are you sure you want to move all <strong>{totalYogis}</strong> yogi(s)
                currently in <strong>{fromStateName}</strong> to <strong>{toStateName}</strong>?
              </p>
            )}

            {isMoving && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p>
                  Moving yogis: {processedCount} / {totalYogis} completed...
                </p>
                <LinearLoader
                  width="100%"
                  amount={totalYogis > 0 ? (processedCount * 100) / totalYogis : 0}
                />
              </div>
            )}

            {finished && failedCount > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <NoticeBox error title="Bulk move completed with errors">
                  Moved {movedCount} yogi(s) successfully, but {failedCount} failed to update.
                </NoticeBox>
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    background: "var(--color-grey-100)",
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "13px",
                  }}
                >
                  <h6 style={{ margin: "0 0 5px 0" }}>Failure Details:</h6>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {errors.map((err, idx) => (
                      <li key={idx} style={{ color: "var(--color-red-600)" }}>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </ModalContent>
      <ModalActions>
        <ButtonStrip>
          {!isMoving && (
            <Button onClick={onCancel} secondary={finished && failedCount > 0}>
              {finished && failedCount > 0 ? "Close" : "Cancel"}
            </Button>
          )}
          {!isMoving && !finished && totalYogis > 0 && (
            <Button primary onClick={handleBulkMove}>
              Move All
            </Button>
          )}
        </ButtonStrip>
      </ModalActions>
    </Modal>
  );
});

export default BulkMoveModal;
