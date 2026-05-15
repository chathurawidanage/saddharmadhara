import { Button, DropdownButton, FlyoutMenu, IconMore16, MenuItem, Tag } from "@dhis2/ui";
import React from "react";
import { canFinalizeRetreat } from "../../utils/retreatUtils";

const RetreatHeader = ({ 
  retreat, 
  onSendInvitations, 
  onFinalise, 
  onEdit, 
  downloadMenu 
}) => {
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
        <Button onClick={onSendInvitations}>
          Send Invitations
        </Button>
        
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
              <MenuItem
                label="Edit Retreat"
                onClick={onEdit}
              />
            </FlyoutMenu>
          }
        />
      </div>
    </div>
  );
};

export default RetreatHeader;
