import { Tab, TabBar } from "@dhis2/ui";
import React from "react";
import { observer } from "mobx-react";
import { FaMale, FaFemale } from "react-icons/fa";

export interface TabGenderCount {
  total: number;
  male: number;
  female: number;
}

interface YogiListTabsProps {
  selectionStates: any[];
  selectionState: string;
  onStateChange: (code: string) => void;
  countByState: Record<string, TabGenderCount | number>;
}

const getCounts = (
  countVal: TabGenderCount | number | undefined
): TabGenderCount => {
  if (typeof countVal === "number") {
    return { total: countVal, male: 0, female: 0 };
  }
  return {
    total: countVal?.total ?? 0,
    male: countVal?.male ?? 0,
    female: countVal?.female ?? 0,
  };
};

const renderTabContent = (
  name: string,
  countVal: TabGenderCount | number | undefined,
  showSubRow = true
) => {
  const counts = getCounts(countVal);
  const cleanName = (name || "").replace(/\s*\[.*?\]\s*/g, "").trim();

  return (
    <div className="yogi-tab-two-rows">
      <div className="yogi-tab-row1">
        <span className="yogi-tab-name">{cleanName}</span>
        {showSubRow && (
          <span className={`yogi-tab-total ${counts.total === 0 ? "zero" : ""}`}>
            {counts.total}
          </span>
        )}
      </div>
      <div className="yogi-tab-row2">
        {showSubRow ? (
          <>
            <span className="count-male">
              <FaMale className="tab-gender-icon male" />
              {counts.male}
            </span>
            <span className="count-female">
              <FaFemale className="tab-gender-icon female" />
              {counts.female}
            </span>
          </>
        ) : (
          <span className="row2-spacer">&nbsp;</span>
        )}
      </div>
    </div>
  );
};

const YogiListTabs = observer(({ 
  selectionStates, 
  selectionState, 
  onStateChange, 
  countByState 
}: YogiListTabsProps) => {
  const renderTabs = () => {
    const tabsList: React.ReactNode[] = [];
    selectionStates.forEach((state) => {
      tabsList.push(
        <Tab
          key={state.code}
          selected={selectionState === state.code}
          onClick={() => onStateChange(state.code)}
        >
          {renderTabContent(state.name, countByState[state.code], true)}
        </Tab>
      );

      if (state.code === "applied") {
        tabsList.push(
          <Tab
            key="proposed"
            selected={selectionState === "proposed"}
            onClick={() => onStateChange("proposed")}
            className={`proposed-tab ${selectionState === "proposed" ? "selected" : ""}`}
          >
            {renderTabContent("Selection", undefined, false)}
          </Tab>
        );
      }
    });
    return tabsList;
  };

  return (
    <div>
      <TabBar>
        {renderTabs()}
      </TabBar>
    </div>
  );
});

export default YogiListTabs;

