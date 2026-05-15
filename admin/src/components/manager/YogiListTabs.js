import { Tab, TabBar } from "@dhis2/ui";
import React from "react";
import { observer } from "mobx-react";

const YogiListTabs = observer(({ 
  selectionStates, 
  selectionState, 
  onStateChange, 
  countByState 
}) => {
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
