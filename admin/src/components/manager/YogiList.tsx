import { LinearLoader, NoticeBox, Tab, TabBar } from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useEffect, useState, useRef } from "react";
import { FaMale, FaFemale } from "react-icons/fa";
import { useStore } from "../../stores/StoreProvider";
import "./YogiList.css";
import YogiListToolbar from "./YogiListToolbar";
import YogiListTabs from "./YogiListTabs";
import YogiTable from "./YogiTable";
import BulkMoveModal from "./BulkMoveModal";
import { ProposedYogiDetail } from "./ProposedYogiDetail";
import { Retreat, Yogi, Gender, MaritalState, SelectionState } from "../../types/domain";

import {
  SELECTION_PRIORITY_SORT,
  AGE_SORT,
  sortYogiList,
} from "../../utils/yogiUtils";


interface YogisListProps {
  retreat: Retreat;
}

const YogisList = observer(({ retreat }: YogisListProps) => {
  const store = useStore();
  const [selectionState, setSelectionState] = useState<string>(
    store.metadata?.selectionStates[0]?.code || "",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [yogiList, setYogiList] = useState<Yogi[]>([]);
  const [yogisFetched, setYogisFetched] = useState(false);

  const [loadProgress, setLoadProgress] = useState(0);

  const [filters, setFilters] = useState({
    male: true,
    female: true,
    reverend: true,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState(SELECTION_PRIORITY_SORT);
  const sortByRef = useRef(sortBy);

  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);

  const [proposedGender, setProposedGender] = useState<Gender>(Gender.MALE);

  const getProposedYogi = () => {
    if (selectionState !== "proposed") return null;
    const appliedOfGender = yogiList.filter(
      (yogi) =>
        yogi.expressionOfInterests[retreat.code]?.state === SelectionState.APPLIED &&
        yogi.attributes.gender === proposedGender
    );

    if (appliedOfGender.length === 0) return null;

    const sorted = [...appliedOfGender];
    sortYogiList(
      sorted,
      retreat,
      SELECTION_PRIORITY_SORT,
      store.metadata?.retreats || [],
      store.metadata?.eoiSummary || []
    );

    return sorted[0];
  };

  const proposedYogi = getProposedYogi();

  const countByState: Record<string, number> = {};
  yogiList.forEach((yogi) => {
    const state = yogi.expressionOfInterests[retreat.code]?.state;
    if (state) {
      if (!countByState[state]) {
        countByState[state] = 0;
      }
      countByState[state]++;
    }
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectionState, filters]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    (async () => {
      if (!store.yogis) return;
      setYogisFetched(false);
      setLoadProgress(0);
      const loadedYogis = await store.yogis.fetchYogiBatch(
        retreat.code,
        retreat.name,
        ({ completed, total }) => {
          setLoadProgress(total === 0 ? 100 : (completed * 100) / total);
        },
      );

      sortYogiList(
        loadedYogis,
        retreat,
        sortByRef.current,
        store.metadata?.retreats || [],
        store.metadata?.eoiSummary || [],
      );
      setYogiList(loadedYogis);
      setYogisFetched(true);
    })();
  }, [retreat, store.yogis]);

  if (!yogisFetched)
    return <LinearLoader width="100%" amount={loadProgress} margin="0" />;

  const filteredYogis = selectionState === "proposed"
    ? (proposedYogi ? [proposedYogi] : [])
    : yogiList
        .filter(
          (yogi) =>
            yogi.expressionOfInterests[retreat.code].state === selectionState,
        )
        .filter(
          (yogi) =>
            filters.male ||
            yogi.attributes.gender !== Gender.MALE,
        )
        .filter(
          (yogi) =>
            filters.female ||
            yogi.attributes.gender !== Gender.FEMALE,
        )
        .filter(
          (yogi) =>
            filters.reverend ||
            yogi.attributes.maritalState !== MaritalState.REVEREND,
        )
        .filter((yogi) => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          const name =
            yogi.attributes.fullName?.toLowerCase() || "";
          const mobile =
            yogi.attributes.mobile?.toLowerCase() || "";
          const nic = yogi.attributes.nic?.toLowerCase() || "";
          const passport =
            yogi.attributes.passport?.toLowerCase() || "";

          return (
            name.includes(query) ||
            mobile.includes(query) ||
            nic.includes(query) ||
            passport.includes(query)
          );
        });

  return (
    <div className="yogi-list-panel">
      {store.metadata?.requestStates.supportingError && (
        <div className="yogi-list-notice-box-wrapper">
          <NoticeBox error title="Supporting metadata unavailable">
            {store.metadata.requestStates.supportingError}
          </NoticeBox>
        </div>
      )}
      {store.yogis?.requestStates.batchErrors[retreat.code] && (
        <div className="yogi-list-notice-box-wrapper">
          <NoticeBox error title="Some yogi records could not be loaded">
            {store.yogis.requestStates.batchErrors[retreat.code]}
          </NoticeBox>
        </div>
      )}
      
      <YogiListToolbar
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        onSortChange={(newSortBy) => {
          sortByRef.current = newSortBy;
          setSortBy(newSortBy);
          setYogiList((currentYogis) => {
            const sortedYogis = [...currentYogis];
            sortYogiList(
              sortedYogis,
              retreat,
              newSortBy,
              store.metadata?.retreats || [],
              store.metadata?.eoiSummary || [],
            );
            return sortedYogis;
          });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={store.metadata?.isAdmin}
        showBulkMove={!retreat.finalized && (selectionState === "applied" || selectionState === "pending")}
        onBulkMoveClick={() => setShowBulkMoveModal(true)}
        disabled={selectionState === "proposed"}
      />

      <YogiListTabs
        selectionStates={store.metadata?.selectionStates || []}
        selectionState={selectionState}
        onStateChange={setSelectionState}
        countByState={countByState}
      />

      {selectionState === "proposed" && (
        <div className="proposed-gender-switch-container">
          <button
            type="button"
            className={`gender-switch-btn male ${proposedGender === Gender.MALE ? "active" : ""}`}
            onClick={() => setProposedGender(Gender.MALE)}
          >
            <FaMale className="gender-icon" />
            <span>Male</span>
          </button>
          <button
            type="button"
            className={`gender-switch-btn female ${proposedGender === Gender.FEMALE ? "active" : ""}`}
            onClick={() => setProposedGender(Gender.FEMALE)}
          >
            <FaFemale className="gender-icon" />
            <span>Female</span>
          </button>
        </div>
      )}

      {selectionState === "proposed" ? (
        proposedYogi ? (
          <ProposedYogiDetail
            yogi={proposedYogi}
            retreat={retreat}
            allRetreats={store.metadata?.retreats || []}
            eoiSummary={store.metadata?.eoiSummary || []}
          />
        ) : (
          <div style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-grey-300)",
            borderRadius: "var(--radius-l)",
            padding: "50px",
            textAlign: "center",
            color: "var(--color-grey-600)",
            marginTop: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
          }}>
            No proposed yogi available for this gender selection.
          </div>
        )
      ) : (
        <YogiTable
          filteredYogis={filteredYogis}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(page: number) => setCurrentPage(page)}
          retreat={retreat}
          selectionState={selectionState}
          allYogis={yogiList}
          allRetreats={store.metadata?.retreats || []}
          eoiSummary={store.metadata?.eoiSummary || []}
        />
      )}

      {showBulkMoveModal && (
        <BulkMoveModal
          retreat={retreat}
          fromState={selectionState}
          allYogis={yogiList}
          onCancel={() => setShowBulkMoveModal(false)}
        />
      )}
    </div>
  );
});

export default YogisList;
