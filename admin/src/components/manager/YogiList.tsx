import { LinearLoader, NoticeBox } from "@dhis2/ui";
import { computed } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState, useRef } from "react";
import {
  DHIS2_TEI_ATTRIBUTE_DOB,
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_GENDER,
  DHIS2_TEI_ATTRIBUTE_MARITAL_STATE,
  DHIS2_TEI_ATTRIBUTE_MOBILE,
  DHIS2_TEI_ATTRIBUTE_NIC,
  DHIS2_TEI_ATTRIBUTE_PASSPORT,
  DHIS2_TEI_ATTRIBUTE_YOGI_PRIORITY,
} from "../../dhis2";
import { useStore } from "../../stores/StoreProvider";
import "./YogiList.css";
import YogiListToolbar from "./YogiListToolbar";
import YogiListTabs from "./YogiListTabs";
import YogiTable from "./YogiTable";
import { Retreat, Yogi } from "../../types/domain";

export const SELECTION_PRIORITY_SORT = "selection-priority";
export const AGE_SORT = "age";

export const getYogiSortScore = (yogiObj: Yogi) => {
  // reverends comes first
  let score = 0;
  if (yogiObj.attributes[DHIS2_TEI_ATTRIBUTE_MARITAL_STATE] === "reverend") {
    score += Math.pow(10, 5);
  }

  if (
    yogiObj.attributes[DHIS2_TEI_ATTRIBUTE_YOGI_PRIORITY]?.toLowerCase() ===
    "trust_member"
  ) {
    score += Math.pow(10, 4);
  }

  if (
    yogiObj.attributes[DHIS2_TEI_ATTRIBUTE_YOGI_PRIORITY]?.toLowerCase() ===
    "trust_members_family"
  ) {
    score += Math.pow(10, 3);
  }

  return score;
};

export const selectionPrioritySorter = (y1: Yogi, y2: Yogi, retreat: Retreat) => {
  let y1Score = getYogiSortScore(y1);
  let y2Score = getYogiSortScore(y2);

  if (y1Score === y2Score) {
    // finally sort by applied date, lowest date comes first
    let y1RegisteredDate = new Date(
      y1.expressionOfInterests[retreat.code].occurredAt,
    );
    let y2RegisteredDate = new Date(
      y2.expressionOfInterests[retreat.code].occurredAt,
    );
    return y1RegisteredDate.getTime() - y2RegisteredDate.getTime();
  }

  // highest score comes first
  return y2Score - y1Score;
};

export const ageSorter = (y1: Yogi, y2: Yogi, retreat: Retreat) => {
  let dobY1 = new Date(y1.attributes[DHIS2_TEI_ATTRIBUTE_DOB]);
  let dobY2 = new Date(y2.attributes[DHIS2_TEI_ATTRIBUTE_DOB]);

  let diff = dobY1.getTime() - dobY2.getTime();

  if (diff === 0) {
    return selectionPrioritySorter(y1, y2, retreat);
  } else {
    return diff;
  }
};

export const sortYogiList = (
  yogiList: Yogi[],
  retreat: Retreat,
  sortBy: string = SELECTION_PRIORITY_SORT,
) => {
  if (sortBy === SELECTION_PRIORITY_SORT) {
    yogiList.sort((a, b) => {
      return selectionPrioritySorter(a, b, retreat);
    });
  } else if (sortBy === AGE_SORT) {
    yogiList.sort((a, b) => {
      return ageSorter(a, b, retreat);
    });
  }
};

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

  const countByState = computed(() => {
    let stateMap: Record<string, number> = {};
    yogiList.forEach((yogi) => {
      let state = yogi.expressionOfInterests[retreat.code]?.state;
      if (state) {
        if (!stateMap[state]) {
          stateMap[state] = 0;
        }
        stateMap[state]++;
      }
    });
    return stateMap;
  }).get();

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

      sortYogiList(loadedYogis, retreat, sortByRef.current);
      setYogiList(loadedYogis);
      setYogisFetched(true);
    })();
  }, [retreat, store.yogis]);

  if (!yogisFetched)
    return <LinearLoader width="100%" amount={loadProgress} margin="0" />;

  let filteredYogis = yogiList
    .filter(
      (yogi) =>
        yogi.expressionOfInterests[retreat.code].state === selectionState,
    )
    .filter(
      (yogi) =>
        filters.male ||
        yogi.attributes[DHIS2_TEI_ATTRIBUTE_GENDER].toLowerCase() !== "male",
    )
    .filter(
      (yogi) =>
        filters.female ||
        yogi.attributes[DHIS2_TEI_ATTRIBUTE_GENDER].toLowerCase() !== "female",
    )
    .filter(
      (yogi) =>
        filters.reverend ||
        yogi.attributes[DHIS2_TEI_ATTRIBUTE_MARITAL_STATE].toLowerCase() !==
          "reverend",
    )
    .filter((yogi) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const name =
        yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME]?.toLowerCase() || "";
      const mobile =
        yogi.attributes[DHIS2_TEI_ATTRIBUTE_MOBILE]?.toLowerCase() || "";
      const nic = yogi.attributes[DHIS2_TEI_ATTRIBUTE_NIC]?.toLowerCase() || "";
      const passport =
        yogi.attributes[DHIS2_TEI_ATTRIBUTE_PASSPORT]?.toLowerCase() || "";

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
            sortYogiList(sortedYogis, retreat, newSortBy);
            return sortedYogis;
          });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <YogiListTabs
        selectionStates={store.metadata?.selectionStates || []}
        selectionState={selectionState}
        onStateChange={setSelectionState}
        countByState={countByState}
      />

      <YogiTable
        filteredYogis={filteredYogis}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page: number) => setCurrentPage(page)}
        retreat={retreat}
        selectionState={selectionState}
        allYogis={yogiList}
      />
    </div>
  );
});

export default YogisList;
