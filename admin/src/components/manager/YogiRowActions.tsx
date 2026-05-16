import { useAlert } from "@dhis2/app-runtime";
import {
  Button,
  ButtonStrip,
  DropdownButton,
  FlyoutMenu,
  MenuItem,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  SingleSelectField,
  SingleSelectOption,
  Tag,
  TextAreaField,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useState } from "react";
import {
  DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE,
} from "../../dhis2";
import { useStore } from "../../stores/StoreProvider";
import { Retreat, SelectionState, Yogi } from "../../types/domain";

interface StateChangeButtonProps {
  currentState: string;
  yogi: Yogi;
  retreat: Retreat;
}

export const StateChangeButton = observer(({ currentState, yogi, retreat }: StateChangeButtonProps) => {
  const store = useStore();
  const { show: alertStateChangeStatus } = useAlert(
    ({ yogiName, toState, success }: any) =>
      success
        ? `${yogiName} moved to ${toState}`
        : `Failed to move ${yogiName}`,
    ({ success }: any) => {
      return {
        success,
        critical: !success,
        duration: 2000,
      };
    },
  );

  const { show: changeFromSelectedStatePrompt } = useAlert(
    ({ yogiName }: any) =>
      `Are you sure you want to remove ${yogiName} from the 'Selected' state? This will result in the loss of their room allocations and any attendance records if they exist.`,
    ({ onMoveClicked }: any) => {
      return {
        critical: true,
        permanent: true,
        actions: [
          { label: "Move", onClick: onMoveClicked },
          {
            label: "Don't Move",
            onClick: () => {},
          },
        ],
      };
    },
  );

  const doStateChange = async (toStateCode: SelectionState) => {
    if (!store.yogis) return;
    let success = await store.yogis.changeRetreatState(
      yogi.id,
      retreat.code,
      toStateCode,
    );
    alertStateChangeStatus({
      yogiName: yogi.attributes.fullName,
      toState: toStateCode,
      success,
    });
  };

  const onStateChanged = async (toStateCode: SelectionState) => {
    if (!store.yogis) return;
    if (
      currentState === DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE &&
      yogi.participation[retreat.code]
    ) {
      changeFromSelectedStatePrompt({
        yogiName: yogi.attributes.fullName,
        onMoveClicked: async () => {
          let success = await store.yogis!.deleteParticipationEvent(
            yogi.id,
            retreat,
          );
          if (success) {
            await doStateChange(toStateCode);
          }
        },
      });
    } else {
      await doStateChange(toStateCode);
    }
  };

  return (
    <DropdownButton
      component={
        <FlyoutMenu>
          {(store.metadata?.selectionStates || [])
            .filter((state) => state.code !== currentState)
            .map((state) => {
              return (
                <MenuItem
                  key={state.code}
                  onClick={() => {
                    onStateChanged(state.code);
                  }}
                  label={state.name}
                />
              );
            })}
        </FlyoutMenu>
      }
    >
      Move to
    </DropdownButton>
  );
});

interface RoomSelectProps {
  yogi: Yogi;
  retreat: Retreat;
  allYogis: Yogi[];
}

export const RoomSelect = observer(({ yogi, retreat, allYogis }: RoomSelectProps) => {
  const store = useStore();
  let roomsAssignedToOthers = new Set(
    allYogis
      .filter((y) => y.id !== yogi.id)
      .map((y) => {
        return y.participation[retreat.code]?.room;
      })
      .filter((roomCode) => roomCode !== undefined),
  );

  let roomOptions = (store.metadata?.rooms || [])
    .filter((room) => room.location === retreat.location)
    .filter((room) => !roomsAssignedToOthers.has(room.code))
    .map((room) => (
      <SingleSelectOption label={room.name} value={room.code} key={room.code} />
    ));

  const { show: alertStateChangeStatus } = useAlert(
    ({ yogiName, toRoomCode, success }: any) =>
      success
        ? `${toRoomCode} assigned to ${yogiName}`
        : `Failed to assign room  ${toRoomCode} to ${yogiName}`,
    ({ success }: any) => {
      return {
        success,
        critical: !success,
        duration: 2000,
      };
    },
  );

  const onRoomAssigned = async ({ selected: roomCode }: any) => {
    if (!store.yogis) return;
    let success = await store.yogis.assignRoom(yogi.id, retreat, roomCode);
    alertStateChangeStatus({
      yogiName: yogi.attributes.fullName,
      toRoomCode: roomCode,
      success,
    });
  };

  return (
    <SingleSelectField
      filterable
      clearable
      dense
      placeholder="Room"
      prefix="Room"
      onChange={onRoomAssigned}
      selected={yogi.participation[retreat.code]?.room}
      tabIndex={0}
    >
      {roomOptions}
    </SingleSelectField>
  );
});

interface AttendanceButtonProps {
  yogi: Yogi;
  retreat: Retreat;
}

export const AttendanceButton = observer(({ yogi, retreat }: AttendanceButtonProps) => {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<string | undefined>(
    yogi.participation[retreat.code]?.attendance,
  );
  const [specialComment, setSpecialComment] = useState(
    yogi.participation[retreat.code]?.specialComment || "",
  );
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const attendanceOptions = (store.metadata?.attendance || []).map((att) => (
    <SingleSelectOption label={att?.name} value={att?.code} key={att?.code} />
  ));
  return (
    <div>
      <Modal hide={!showModal}>
        <ModalTitle>
          Mark Attendance for {yogi.attributes.fullName}
        </ModalTitle>
        <ModalContent className="attendance-fields">
          <SingleSelectField
            label="Status"
            required
            selected={status}
            onChange={(selection: any) => {
              setStatus(selection.selected);
            }}
            tabIndex={0}
          >
            {attendanceOptions}
          </SingleSelectField>
          <TextAreaField
            label="Special Comment"
            value={specialComment}
            onChange={(e: any) => setSpecialComment(e.value)}
          />
        </ModalContent>
        <ModalActions>
          <ButtonStrip>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              disabled={status === undefined}
              primary
              onClick={async () => {
                if (!store.yogis) return;
                setIsMarkingAttendance(true);
                await store.yogis.markAttendance(
                  yogi.id,
                  retreat,
                  status!,
                  specialComment,
                );
                setIsMarkingAttendance(false);
                setShowModal(false);
              }}
              loading={isMarkingAttendance}
            >
              Mark
            </Button>
          </ButtonStrip>
        </ModalActions>
      </Modal>
      <Button onClick={() => setShowModal(true)}>
        {status ? "Update Attendance" : "Mark Attendance"}
      </Button>
    </div>
  );
});

interface InvitationIndicatorProps {
  yogi: Yogi;
  retreat: Retreat;
}

export const InvitationIndicator = observer(({ yogi, retreat }: InvitationIndicatorProps) => {
  const status =
    yogi.expressionOfInterests[retreat.code]?.invitationSent || "pending";
  return (
    <div className="invitation-tag-wrapper">
      <Tag positive={status === "sent"}>
        {status === "sent" ? "Invitation Sent" : "Invitation Pending"}
      </Tag>
    </div>
  );
});
