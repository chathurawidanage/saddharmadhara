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
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
} from "../../dhis2";
import { useStore } from "../../stores/StoreProvider";

export const StateChangeButton = ({ currentState, yogi, retreat }) => {
  const store = useStore();
  const { show: alertStateChangeStatus } = useAlert(
    ({ yogiName, toState, success }) =>
      success
        ? `${yogiName} moved to ${toState}`
        : `Failed to move ${yogiName}`,
    ({ success }) => {
      return {
        success,
        critical: !success,
        duration: 2000,
      };
    },
  );

  const { show: changeFromSelectedStatePrompt } = useAlert(
    ({ yogiName }) =>
      `Are you sure you want to remove ${yogiName} from the 'Selected' state? This will result in the loss of their room allocations and any attendance records if they exist.`,
    ({ onMoveClicked }) => {
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

  const doStateChange = async (toStateCode) => {
    let success = await store.yogis.changeRetreatState(
      yogi.id,
      retreat.code,
      toStateCode,
    );
    alertStateChangeStatus({
      yogiName: yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME],
      toState: toStateCode,
      success,
    });
  };

  const onStateChanged = async (toStateCode) => {
    if (
      currentState === DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE &&
      yogi.participation[retreat.code]
    ) {
      changeFromSelectedStatePrompt({
        yogiName: yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME],
        onMoveClicked: async () => {
          let success = await store.yogis.deleteParticipationEvent(
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
          {store.metadata.selectionStates
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
};

export const RoomSelect = observer(({ yogi, retreat, allYogis }) => {
  const store = useStore();
  let roomsAssignedToOthers = new Set(
    allYogis
      .filter((y) => y.id !== yogi.id)
      .map((y) => {
        return y.participation[retreat.code]?.room;
      })
      .filter((roomCode) => roomCode !== undefined),
  );

  let roomOptions = store.metadata.rooms
    .filter((room) => room.location === retreat.location)
    .filter((room) => !roomsAssignedToOthers.has(room.code))
    .map((room) => (
      <SingleSelectOption label={room.name} value={room.code} key={room.code} />
    ));

  const { show: alertStateChangeStatus } = useAlert(
    ({ yogiName, toRoomCode, success }) =>
      success
        ? `${toRoomCode} assigned to ${yogiName}`
        : `Failed to assign room  ${toRoomCode} to ${yogiName}`,
    ({ success }) => {
      return {
        success,
        critical: !success,
        duration: 2000,
      };
    },
  );

  const onRoomAssigned = async ({ selected: roomCode }) => {
    let success = await store.yogis.assignRoom(yogi.id, retreat, roomCode);
    alertStateChangeStatus({
      yogiName: yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME],
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
      tabIndex="0"
    >
      {roomOptions}
    </SingleSelectField>
  );
});

export const AttendanceButton = observer(({ yogi, retreat }) => {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(
    yogi.participation[retreat.code]?.attendance,
  );
  const [specialComment, setSpecialComment] = useState(
    yogi.participation[retreat.code]?.specialComment || "",
  );
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const attendanceOptions = store.metadata?.attendance?.map((att) => (
    <SingleSelectOption label={att?.name} value={att?.code} key={att?.code} />
  ));
  return (
    <div>
      <Modal hide={!showModal}>
        <ModalTitle>
          Mark Attendance for {yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME]}
        </ModalTitle>
        <ModalContent className="attendance-fields">
          <SingleSelectField
            label="Status"
            required
            selected={status}
            onChange={(selection) => {
              setStatus(selection.selected);
            }}
            tabIndex="0"
          >
            {attendanceOptions}
          </SingleSelectField>
          <TextAreaField
            label="Special Comment"
            value={specialComment}
            onChange={(e) => setSpecialComment(e.value)}
          />
        </ModalContent>
        <ModalActions>
          <ButtonStrip>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              disabled={status === undefined}
              primary
              onClick={async () => {
                setIsMarkingAttendance(true);
                await store.yogis.markAttendance(
                  yogi.id,
                  retreat,
                  status,
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

export const InvitationIndicator = observer(({ yogi, retreat }) => {
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
