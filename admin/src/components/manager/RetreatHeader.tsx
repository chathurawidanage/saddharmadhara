import { useAlert } from "@dhis2/app-runtime";
import {
  Button,
  DropdownButton,
  FlyoutMenu,
  IconMore16,
  MenuItem,
  Tag,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { ReactNode } from "react";
import { canFinalizeRetreat } from "../../utils/retreatUtils";
import { Retreat } from "../../types/domain";

interface RetreatHeaderProps {
  retreat: Retreat;
  onSendInvitations: () => void;
  onFinalise: () => void;
  onEdit: () => void;
  downloadMenu: ReactNode;
}

const RetreatHeader = observer(({
  retreat,
  onSendInvitations,
  onFinalise,
  onEdit,
  downloadMenu,
}: RetreatHeaderProps) => {

  const { show: showAlert } = useAlert("Private link copied to clipboard", {
    duration: 2000,
    success: true,
  });

  const handleCopyLink = () => {
    const link = `https://application.srisambuddhamission.org/?retreat=${retreat.retreatCode}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        showAlert();
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  return (
    <div className="retreat-header-container">
      <div className="retreat-header-title-row">
        <h2 className="retreat-header-title-text">{retreat.name} </h2>
        {retreat.finalized ? (
          <Tag positive bold>
            Finalized
          </Tag>
        ) : null}
        <Tag positive={!retreat.disabled} negative={retreat.disabled}>
          {retreat.disabled ? "Disabled" : "Active"}
        </Tag>
      </div>
      <div className="retreat-header-actions">
        <Button onClick={onSendInvitations}>Send Invitations</Button>

        {downloadMenu}

        <Button
          primary
          disabled={!canFinalizeRetreat(retreat)}
          onClick={onFinalise}
        >
          Finalise Retreat
        </Button>

        <DropdownButton
          icon={<IconMore16 />}
          component={
            <FlyoutMenu>
              <MenuItem label="Edit Retreat" onClick={onEdit} />
              <MenuItem label="Copy Link" onClick={handleCopyLink} />
            </FlyoutMenu>
          }
        />
      </div>
    </div>
  );
});

export default RetreatHeader;
