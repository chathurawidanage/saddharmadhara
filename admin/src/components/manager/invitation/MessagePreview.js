import React from "react";
import { getInvitationMessage } from "../../../services/invitationService";

const MessagePreview = ({ retreat, confirmationDeadline }) => {
  return (
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
  );
};

export default MessagePreview;
