import {
  Button,
  IconArrowLeft16,
  CircularLoader,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import {
  buildYogiExport,
  downloadTextFile,
} from "../services/exportService";
import YogisList, { sortYogiList } from "./manager/YogiList";
import RetreatFinaliseModal from "./RetreatFinaliseModal";
import RetreatInvitationModal from "./RetreatInvitationModal";
import RetreatModel from "./RetreatModal";
import { useStore } from "../stores/StoreProvider";
import RetreatHeader from "./manager/RetreatHeader";
import RetreatDetails from "./manager/RetreatDetails";
import RetreatDownloadMenu from "./manager/RetreatDownloadMenu";

const styles = {
  container: {
    marginTop: 20,
    padding: "0 20px",
  },
  backButton: {
    marginBottom: 20,
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
    gender,
    selectionState,
    format,
  ) => {
    const retreatCode = retreat.code;
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

        <RetreatHeader
          retreat={retreat}
          onSendInvitations={() => setShowInvitationModel(true)}
          onFinalise={() => setShowFinaliseModel(true)}
          onEdit={() => setShowEditRetreatModel(true)}
          downloadMenu={
            <RetreatDownloadMenu onDownload={downloadYogiList} />
          }
        />

        {showInvitationModel && (
          <RetreatInvitationModal
            retreat={retreat}
            onCancel={() => setShowInvitationModel(false)}
          />
        )}

        {showFinaliseModel && (
          <RetreatFinaliseModal
            retreat={retreat}
            onCancel={() => setShowFinaliseModel(false)}
          />
        )}

        {showEditRetreatModel && (
          <RetreatModel
            retreat={retreat}
            onCancel={() => setShowEditRetreatModel(false)}
          />
        )}

        <RetreatDetails retreat={retreat} />

        <div>
          <YogisList retreat={retreat} />
        </div>
      </div>
    </div>
  );
});

export default RetreatManager;
