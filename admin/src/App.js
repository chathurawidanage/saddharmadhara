import React from "react";
import { DataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import classes from "./App.module.css";
import { Card } from "@dhis2-ui/card";

const query = {
  retreats: {
    resource: "optionSets/nPgtl7tFEpV.json",
    params: {
      fields: "options[*]",
    },
  },
};

const MyApp = () => (
  <div className={classes.container}>
    <DataQuery query={query}>
      {({ error, loading, data }) => {
        console.log(data);
        if (error) return <span>ERROR</span>;
        if (loading) return <span>...</span>;

        return (
          <>
            {data.retreats.options.map((retreat) => {
              return <Card>
                <h3>
                    {retreat.name}
                </h3>
              </Card>;
            })}
          </>
        );
      }}
    </DataQuery>
  </div>
);

export default MyApp;
