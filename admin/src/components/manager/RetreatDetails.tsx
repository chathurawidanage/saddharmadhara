import {
  Tag,
  Switch,
  CircularLoader,
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  ButtonStrip,
  Button,
  NoticeBox,
} from "@dhis2/ui";
import { useAlert } from "@dhis2/app-runtime";
import { observer } from "mobx-react";
import React, { useState } from "react";
import {
  FaGlobe,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaSlidersH,
  FaHourglassHalf,
} from "react-icons/fa";
import RetreatLocation from "../RetreatLocation";
import { Retreat } from "../../types/domain";
import { useStore } from "../../stores/StoreProvider";
import {
  DISCRETIONARY_QUOTA_PERCENTAGE,
  DISCRETIONARY_QUOTA_MAX_CAP,
} from "../../utils/yogiUtils";

interface RetreatDetailsProps {
  retreat: Retreat;
}

const RetreatDetails = observer(({ retreat }: RetreatDetailsProps) => {
  const store = useStore();
  const [updatingDisabled, setUpdatingDisabled] = useState(false);
  const [pendingTargetState, setPendingTargetState] = useState<boolean | null>(null);

  const { show: showSuccessAlert } = useAlert(
    ({ message }: { message: string }) => message,
    { success: true, duration: 3000 }
  );

  const { show: showErrorAlert } = useAlert(
    ({ message }: { message: string }) => message,
    { critical: true, duration: 4000 }
  );

  const discretionaryInfo = store.yogis?.getDiscretionaryQuota(retreat.code);

  const isRetreatDatePassed = (() => {
    if (!retreat.date) return false;
    const dateStr = retreat.date.toISOString().split("T")[0];
    return new Date(`${dateStr}T23:59:59.999+05:30`).getTime() < Date.now();
  })();

  const isDeadlineExpired = (() => {
    if (!retreat.confirmationDeadline) return false;
    const dateStr = retreat.confirmationDeadline.split("T")[0];
    return new Date(`${dateStr}T23:59:59.999+05:30`).getTime() < Date.now();
  })();

  const formattedDeadline = (() => {
    if (!retreat.confirmationDeadline) return "";
    const dateStr = retreat.confirmationDeadline.split("T")[0];
    const dateObj = new Date(`${dateStr}T00:00:00`);
    if (isNaN(dateObj.getTime())) return retreat.confirmationDeadline;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

  const confirmToggleAcceptApplications = async () => {
    if (pendingTargetState === null) return;
    const targetChecked = pendingTargetState;
    setUpdatingDisabled(true);
    try {
      // targetChecked === true means retreat is enabled (disabled = false)
      // targetChecked === false means retreat is disabled (disabled = true)
      const disabledValue = !targetChecked;
      const success = await store.metadata?.setRetreatDisabled(retreat, disabledValue);
      if (success) {
        showSuccessAlert({
          message: targetChecked
            ? "Retreat enabled. Accepting applications."
            : "Retreat disabled. Applications closed.",
        });
        setPendingTargetState(null);
      } else {
        showErrorAlert({
          message: "Failed to update retreat status. Please try again.",
        });
      }
    } catch (err) {
      console.error("Failed to toggle retreat status:", err);
      showErrorAlert({
        message: "An error occurred while updating retreat status.",
      });
    } finally {
      setUpdatingDisabled(false);
    }
  };

  return (
    <div className="retreat-details-row">
      <div>
        <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
      </div>
      <div>
        <Tag neutral>{retreat.retreatCode}</Tag>
      </div>
      <div className="retreat-detail-item capitalize">
        <FaGlobe className="retreat-detail-icon globe" />
        <span>{retreat.medium || "Sinhala"}</span>
      </div>
      <div className="retreat-detail-item">
        <FaCalendarAlt className="retreat-detail-icon calendar" />
        <span>{retreat.date.toDateString()}</span>
      </div>
      <div className="retreat-detail-item">
        <FaClock className="retreat-detail-icon clock" />
        <span>{retreat.noOfDays} Days</span>
      </div>
      <div className="retreat-detail-item">
        <FaMapMarkerAlt className="retreat-detail-icon location" />
        <RetreatLocation locationId={retreat.location} />
      </div>
      <div className="retreat-detail-item">
        <FaUsers className="retreat-detail-icon users" />
        <span>{retreat.totalYogis} Yogis</span>
      </div>
      {discretionaryInfo && (
        <div
          className="discretionary-quota-pill"
          title={`Dynamic wildcard quota based on ${Math.round(DISCRETIONARY_QUOTA_PERCENTAGE * 100)}% of active Pending/Selected yogis across retreat (max ${DISCRETIONARY_QUOTA_MAX_CAP})`}
        >
          <FaSlidersH className="discretionary-pill-icon" />
          <span className="discretionary-pill-label">Selector's Discretions</span>
          <span className="discretionary-pill-value">
            {discretionaryInfo.usedSlots}/{discretionaryInfo.maxSlots}
          </span>
        </div>
      )}
      {!isRetreatDatePassed && (
        <div className="retreat-details-right">
          {retreat.confirmationDeadline ? (
            <div
              className={`confirmation-deadline-pill ${
                isDeadlineExpired ? "expired" : ""
              }`}
            >
              <FaHourglassHalf className="deadline-pill-icon" />
              <span className="deadline-pill-label">Confirmation Deadline</span>
              <span className="deadline-pill-value">{formattedDeadline}</span>
            </div>
          ) : null}
          <div className="retreat-disable-switch-wrapper">
            <Switch
              dense
              checked={!retreat.disabled}
              disabled={updatingDisabled}
              label={
                !retreat.disabled
                  ? "Accepting applications"
                  : "Applications closed"
              }
              onChange={({ checked }: { checked: boolean }) => setPendingTargetState(checked)}
            />
            {updatingDisabled && <CircularLoader extrasmall />}
          </div>
        </div>
      )}
      {pendingTargetState !== null && (
        <Modal onClose={updatingDisabled ? undefined : () => setPendingTargetState(null)}>
          <ModalTitle>
            {pendingTargetState ? "Open Applications?" : "Stop Accepting Applications?"}
          </ModalTitle>
          <ModalContent>
            {pendingTargetState ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "20px" }}>
                  Are you sure you want to open applications for{" "}
                  <strong>
                    {retreat.name} ({retreat.retreatCode})
                  </strong>
                  ?
                </p>
                <NoticeBox title="What is going to happen">
                  This retreat will be marked as active and will immediately become available on the public application portal. Yogis will be able to submit new applications.
                </NoticeBox>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "20px" }}>
                  Are you sure you want to stop accepting applications for{" "}
                  <strong>
                    {retreat.name} ({retreat.retreatCode})
                  </strong>
                  ?
                </p>
                <NoticeBox warning title="What is going to happen">
                  This retreat will be marked as disabled and hidden from the public application portal. Yogis will no longer be able to apply. Any applications already received will not be affected.
                </NoticeBox>
              </div>
            )}
          </ModalContent>
          <ModalActions>
            <ButtonStrip>
              <Button
                secondary
                disabled={updatingDisabled}
                onClick={() => setPendingTargetState(null)}
              >
                Cancel
              </Button>
              <Button
                primary={pendingTargetState}
                destructive={!pendingTargetState}
                loading={updatingDisabled}
                disabled={updatingDisabled}
                onClick={confirmToggleAcceptApplications}
              >
                {pendingTargetState ? "Accept Applications" : "Stop Accepting Applications"}
              </Button>
            </ButtonStrip>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
});

export default RetreatDetails;
