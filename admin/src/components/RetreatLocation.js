import { useDataQuery } from "@dhis2/app-runtime";
import React from "react";
import { CircularLoader } from "@dhis2/ui";

const RetreatLocation = ({ locationId }) => {
  const { error, loading, data } = useDataQuery({
    orgUnit: {
      resource: `organisationUnits/${locationId}.json`,
      params: {
        fields: "name",
      },
    },
  });
  if (error) return <span>ERROR</span>;
  if (loading) return <CircularLoader extrasmall />;

  return <>{data?.orgUnit.name}</>;
};

export default RetreatLocation;
