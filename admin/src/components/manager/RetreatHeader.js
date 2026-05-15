import { Button, DropdownButton, FlyoutMenu, IconMore16, MenuItem, Tag } from "@dhis2/ui";
import React from "react";
import { canFinalizeRetreat } from "../../utils/retreatUtils";

const styles = {
  retreatHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 16,
  },
  retreatHeaderButtons: {
    display: "flex",
    flexDirection: "row",
    columnGap: 10,
    alignItems: "center",
  },
  retreatHeaderTitle: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
};

const RetreatHeader = ({ 
  retreat, 
  onSendInvitations, 
  onFinalise, 
  onEdit, 
  downloadMenu 
}) => {
  return (
    <div style={styles.retreatHeader}>
      <div style={styles.retreatHeaderTitle}>
        <h2 style={{ padding: 0, margin: 0 }}>{retreat.name} </h2>
        {retreat.finalized ? (
          <Tag positive bold>
            Finalized
          </Tag>
        ) : null}
        <Tag positive={!retreat.disabled} negative={retreat.disabled}>
          {retreat.disabled ? "Disabled" : "Active"}
        </Tag>
      </div>
      <div style={styles.retreatHeaderButtons}>
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
