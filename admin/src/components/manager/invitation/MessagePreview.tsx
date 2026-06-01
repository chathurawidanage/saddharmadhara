import React from "react";
import { getInvitationMessage } from "../../../services/invitationService";
import "./MessagePreview.css";
import { Retreat } from "../../../types/domain";

interface MessagePreviewProps {
  retreat: Retreat;
  confirmationDeadline: string;
}

const MessagePreview = ({ retreat, confirmationDeadline }: MessagePreviewProps) => {
  return (
    <div>
      <h6 className="message-preview-title">
        Check the correctness of the message below
      </h6>
      <textarea
        className="message-preview-textarea"
        disabled={true}
        value={getInvitationMessage(
          "yogi-id",
          "yogi-full-name",
          retreat.retreatCode,
          retreat.date,
          retreat.endDate ?? "",
          confirmationDeadline,
          retreat.retreatType,
        )}
      />
    </div>
  );
};

export default MessagePreview;
