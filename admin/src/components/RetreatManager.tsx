import {
  Button,
  IconArrowLeft16,
  CircularLoader,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  buildYogiExport,
  downloadTextFile,
} from "../services/exportService";
import YogisList from "./manager/YogiList";
import { sortYogiList } from "../utils/yogiUtils";
import RetreatFinaliseModal from "./RetreatFinaliseModal";
import RetreatInvitationModal from "./RetreatInvitationModal";
import RetreatModal from "./RetreatModal";
import { useStore } from "../stores/StoreProvider";
import RetreatHeader from "./manager/RetreatHeader";
import RetreatDetails from "./manager/RetreatDetails";
import RetreatDownloadMenu from "./manager/RetreatDownloadMenu";
import "./RetreatManager.css";
import { Yogi } from "../types/domain";

const RetreatManager = observer(() => {
  const store = useStore();
  const params = useParams();
  const navigate = useNavigate();

  const [showFinaliseModel, setShowFinaliseModel] = useState(false);
  const [showInvitationModel, setShowInvitationModel] = useState(false);
  const [showEditRetreatModel, setShowEditRetreatModel] = useState(false);

  if (!store.metadata) return null;
  const retreatId = params.retreatId;
  const retreat = retreatId ? store.metadata.retreatsMapWithIdKey[retreatId] : undefined;

  if (!retreat) {
    return (
      <div className="retreat-manager-loading-container">
        <CircularLoader />
      </div>
    );
  }

  const downloadYogiList = async (
    gender: string,
    selectionState: string,
    format: string,
  ) => {
    if (!store.yogis) return;
    const retreatCode = retreat.code;
    const yogiIdList = await store.yogis.fetchExpressionOfInterests(
      retreatCode,
      retreat.name,
    );

    if (!yogiIdList) return;

    const yogis = yogiIdList
      .map((yogiId) => store.yogis?.yogiIdToObjectMap.get(yogiId))
      .filter((yogi): yogi is Yogi => !!yogi);
    sortYogiList(yogis, retreat);

    const formattedList = buildYogiExport(
      yogis,
      retreatCode,
      gender,
      selectionState,
      format,
      retreat,
    );

    downloadTextFile(
      formattedList,
      `${retreatCode}_${gender}_${selectionState}`,
      format as any,
    );
  };

  return (
    <div className="retreat-manager-container">
      <div>
        <div className="retreat-manager-back-button">
          <Button
            small
            icon={<IconArrowLeft16 />}
            onClick={() => {
              navigate("/");
            }}
          >
            Back to Seasons Landing
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
          <RetreatModal
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
