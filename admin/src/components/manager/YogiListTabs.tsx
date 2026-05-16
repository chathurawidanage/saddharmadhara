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
  return (
    <div>
      <TabBar>
        {selectionStates.map((state) => {
          return (
            <Tab
              key={state.code}
              selected={selectionState === state.code}
              onClick={() => onStateChange(state.code)}
            >
              {state.name} [{countByState[state.code] || "0"}]
            </Tab>
          );
        })}
      </TabBar>
    </div>
  );
});

export default YogiListTabs;
