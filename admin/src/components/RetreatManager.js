import {
  Button,
  DropdownButton,
  FlyoutMenu,
  IconArrowLeft16,
  MenuItem,
  Tag,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import RetreatLocation from "./RetreatLocation";
import YogisList from "./manager/YogiList";
import RetreatFinaliseModal from "./RetreatFinaliseModal";
import {
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_GENDER,
} from "../dhis2";
import { useConfig } from "@dhis2/app-runtime";
import RetreatInvitationModal from "./RetreatInvitationModal";

const styles = {
  container: {
    marginTop: 5,
  },
  backButton: {
    marginBottom: 10,
  },
  mediumText: {
    textTransform: "capitalize",
  },
  retreatHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  retreatHeaderButtons: {
    display: "flex",
    flexDirection: "row",
    columnGap: 10,
  },
  retreatHeaderTitle: {
    display: "flex",
    flexDirection: "row",
    columnGap: 10,
    alignItems: "center",
  },
};

function downloadTextFile(text, fileName) {
  const BOM = "\uFEFF"; // UTF-8 BOM
  const blob = new Blob([BOM + text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const RetreatManager = observer(({ store }) => {
  const { baseUrl } = useConfig();
  const params = useParams();
  const navigate = useNavigate();

  const [showFinaliseModel, setShowFinaliseModel] = React.useState(false);
  const [showInvitationModel, setShowInvitationModel] = React.useState(false);

  const retreat = store.metadata.retreatsMapWithIdKey[params.retreatId];

  const openDownloadLink = (url) => {
    let tempElement = document.createElement("a");
    tempElement.href = baseUrl;
    window.open(new URL(url, tempElement.href), "_blank");
  };

  const downloadYogiList = async (retreatCode, gender, selectionState) => {
    const yogis = await store.yogis.fetchExpressionOfInterests(retreatCode);
    const yogiNames = [];
    let index = 0;
    for (const yogiId of yogis) {
      const yogi = store.yogis.yogiIdToObjectMap[yogiId];
      if (
        yogi.attributes[DHIS2_TEI_ATTRIBUTE_GENDER] === gender &&
        yogi.expressionOfInterests[retreatCode].state === selectionState
      ) {
        yogiNames.push(
          `${(++index).toString().padStart(2, "0")} ${yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME].trim()}`,
        );
      }
    }
    downloadTextFile(yogiNames.join("\n"), `${retreatCode}_${gender}`);
  };

  return (
    <Container style={styles.container}>
      <div>
        <div>
          <Row>
            <Col style={styles.backButton}>
              <Button
                small
                icon={<IconArrowLeft16 />}
                onClick={() => {
                  navigate("/");
                }}
              >
                Back to Retreats List
              </Button>
            </Col>
          </Row>
          <Row>
            <Col style={styles.retreatHeader}>
              <div style={styles.retreatHeaderTitle}>
                <h3 style={{ padding: 0, margin: 0 }}>{retreat.name} </h3>
                {retreat.finalized ? (
                  <Tag positive bold>
                    Finalized
                  </Tag>
                ) : null}
              </div>
              <div style={styles.retreatHeaderButtons}>
                <Button onClick={() => setShowInvitationModel(true)}>
                  Send Invitations
                </Button>
                {showInvitationModel && (
                  <RetreatInvitationModal
                    retreat={retreat}
                    store={store}
                    onCancel={() => setShowInvitationModel(false)}
                  />
                )}
                <DropdownButton
                  component={
                    <FlyoutMenu>
                      <MenuItem label="Applied">
                        {["Male", "Female"].map((gender) => (
                          <MenuItem
                            onClick={() => {
                              downloadYogiList(
                                retreat.code,
                                gender.toLowerCase(),
                                "applied",
                              );
                            }}
                            label={gender}
                          />
                        ))}
                      </MenuItem>
                      <MenuItem label="Pending Confirmation">
                        {["Male", "Female"].map((gender) => (
                          <MenuItem
                            onClick={() => {
                              downloadYogiList(
                                retreat.code,
                                gender.toLowerCase(),
                                "pending",
                              );
                            }}
                            label={gender}
                          />
                        ))}
                      </MenuItem>
                      <MenuItem label="Selected">
                        {["Male", "Female"].map((gender) => (
                          <MenuItem
                            onClick={() => {
                              downloadYogiList(
                                retreat.code,
                                gender.toLowerCase(),
                                "selected",
                              );
                            }}
                            label={gender}
                          />
                        ))}
                      </MenuItem>
                    </FlyoutMenu>
                  }
                >
                  Download
                </DropdownButton>
                <Button
                  primary
                  disabled={
                    Date.now() - retreat.date.getTime() <
                      retreat.noOfDays * 24 * 60 * 60 * 1000 ||
                    retreat.finalized
                  }
                  onClick={() => setShowFinaliseModel(true)}
                >
                  Finalise Retreat
                </Button>
                {showFinaliseModel && (
                  <RetreatFinaliseModal
                    retreat={retreat}
                    store={store}
                    onCancel={() => setShowFinaliseModel(false)}
                  />
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
            </Col>
            <Col>
              <Tag neutral>{retreat.retreatCode}</Tag>
            </Col>
            <Col style={styles.mediumText}>
              🌐 {retreat.medium || "Sinhala"}
            </Col>
            <Col>📅 {retreat.date.toDateString()}</Col>
            <Col>⛺ {retreat.noOfDays} Days</Col>
            <Col>
              📍 <RetreatLocation locationId={retreat.location} />
            </Col>
            <Col>🧘‍♂️ {retreat.totalYogis}</Col>
          </Row>
        </div>
        <div>
          <YogisList retreat={retreat} store={store} />
        </div>
      </div>
    </Container>
  );
});

export default RetreatManager;
