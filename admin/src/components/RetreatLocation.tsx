import { useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader } from "@dhis2/ui";
import React from "react";

interface RetreatLocationProps {
  locationId: string;
}

const RetreatLocation = ({ locationId }: RetreatLocationProps) => {
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

  return <>{(data as any)?.orgUnit?.name}</>;
};

export default RetreatLocation;
