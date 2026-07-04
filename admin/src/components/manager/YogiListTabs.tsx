import { Tab, TabBar } from "@dhis2/ui";
import React from "react";
import { observer } from "mobx-react";

interface YogiListTabsProps {
  selectionStates: any[];
  selectionState: string;
  onStateChange: (code: string) => void;
  countByState: Record<string, number>;
}

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
          {state.name} [{countByState[state.code] || "0"}]
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
            Selection
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
