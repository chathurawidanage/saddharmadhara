import {
  Button,
  DropdownButton,
  FlyoutMenu,
  IconArrowLeft16,
  IconMore16,
  MenuItem,
  Tag,
  CircularLoader,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { canFinalizeRetreat } from "../utils/retreatUtils";
import {
  buildYogiExport,
  downloadTextFile,
  YOGI_EXPORT_DEFINITIONS,
  YOGI_EXPORT_FORMATS,
  YOGI_EXPORT_GENDERS,
} from "../services/exportService";
import YogisList, { sortYogiList } from "./manager/YogiList";
import RetreatFinaliseModal from "./RetreatFinaliseModal";
import RetreatInvitationModal from "./RetreatInvitationModal";
import RetreatLocation from "./RetreatLocation";
import RetreatModel from "./RetreatModal";
import { useStore } from "../stores/StoreProvider";

const styles = {
  container: {
    marginTop: 20,
    padding: "0 20px",
  },
  backButton: {
    marginBottom: 20,
  },
  mediumText: {
    textTransform: "capitalize",
    fontWeight: 500,
  },
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
  detailsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
    padding: "16px",
    background: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#404b5a",
  },
};

const RetreatManager = observer(() => {
  const store = useStore();
  const params = useParams();
  const navigate = useNavigate();

  const [showFinaliseModel, setShowFinaliseModel] = React.useState(false);
  const [showInvitationModel, setShowInvitationModel] = React.useState(false);
  const [showEditRetreatModel, setShowEditRetreatModel] = React.useState(false);

  const retreat = store.metadata.retreatsMapWithIdKey[params.retreatId];

  if (!retreat) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "100px",
        }}
      >
        <CircularLoader />
      </div>
    );
  }

  const downloadYogiList = async (
    retreatCode,
    gender,
    selectionState,
    format,
  ) => {
    const yogis = await store.yogis.fetchExpressionOfInterests(
      retreatCode,
      retreat.name,
    );

    const yogiObj = yogis.map(
      (yogiId) => store.yogis.yogiIdToObjectMap[yogiId],
    );
    sortYogiList(yogiObj, retreat);

    const formattedList = buildYogiExport(
      yogiObj,
      retreatCode,
      gender,
      selectionState,
      format,
      retreat,
    );

    downloadTextFile(
      formattedList,
      `${retreatCode}_${gender}_${selectionState}`,
      format,
    );
  };

  return (
    <div style={styles.container}>
      <div>
        <div style={styles.backButton}>
          <Button
            small
            icon={<IconArrowLeft16 />}
            onClick={() => {
              navigate("/");
            }}
          >
            Back to Retreats List
          </Button>
        </div>

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
            <Button onClick={() => setShowInvitationModel(true)}>
              Send Invitations
            </Button>
            {showInvitationModel && (
              <RetreatInvitationModal
                retreat={retreat}
                onCancel={() => setShowInvitationModel(false)}
              />
            )}
            <DropdownButton
              component={
                <FlyoutMenu>
                  {YOGI_EXPORT_DEFINITIONS.map(
                    ({ label, selectionState }) => (
                      <MenuItem label={label} key={selectionState}>
                        {YOGI_EXPORT_GENDERS.map((gender) => (
                          <MenuItem label={gender.label} key={gender.value}>
                            {YOGI_EXPORT_FORMATS.map((exportFormat) => (
                              <MenuItem
                                key={`${selectionState}-${gender.value}-${exportFormat.format}`}
                                label={exportFormat.label}
                                onClick={() => {
                                  downloadYogiList(
                                    retreat.code,
                                    gender.value,
                                    selectionState,
                                    exportFormat.format,
                                  );
                                }}
                              />
                            ))}
                          </MenuItem>
                        ))}
                      </MenuItem>
                    ),
                  )}
                </FlyoutMenu>
              }
            >
              Download
            </DropdownButton>
            <Button
              primary
              disabled={!canFinalizeRetreat(retreat)}
              onClick={() => setShowFinaliseModel(true)}
            >
              Finalise Retreat
            </Button>
            {showFinaliseModel && (
              <RetreatFinaliseModal
                retreat={retreat}
                onCancel={() => setShowFinaliseModel(false)}
              />
            )}

            <DropdownButton
              icon={<IconMore16 />}
              component={
                <FlyoutMenu>
                  <MenuItem
                    label="Edit Retreat"
                    onClick={() => setShowEditRetreatModel(true)}
                  />
                </FlyoutMenu>
              }
            />

            {showEditRetreatModel && (
              <RetreatModel
                retreat={retreat}
                onCancel={() => setShowEditRetreatModel(false)}
              />
            )}
          </div>
        </div>

        <div style={styles.detailsRow}>
          <div>
            <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
          </div>
          <div>
            <Tag neutral>{retreat.retreatCode}</Tag>
          </div>
          <div style={{ ...styles.detailItem, textTransform: "capitalize" }}>
            🌐 {retreat.medium || "Sinhala"}
          </div>
          <div style={styles.detailItem}>📅 {retreat.date.toDateString()}</div>
          <div style={styles.detailItem}>⛺ {retreat.noOfDays} Days</div>
          <div style={styles.detailItem}>
            📍 <RetreatLocation locationId={retreat.location} />
          </div>
          <div style={styles.detailItem}>🧘‍♂️ {retreat.totalYogis}</div>
        </div>

        <div>
          <YogisList retreat={retreat} />
        </div>
      </div>
    </div>
  );
});

export default RetreatManager;

