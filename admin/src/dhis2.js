export const DHIS_RETREATS_OPTION_SET_ID = "ys2Pv9hTS0O";

export const DHIS2_RETREAT_DATE_ATTRIBUTE = "sCzsZZ7m37E";
export const DHIS2_RETREAT_DISABLED_ATTRIBUTE = "hp92k6RhLJS";
export const DHIS2_RETREAT_LOCATION_ATTRIBUTE = "TuaBW7iXTGw";
export const DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE = "DkyFJvcKgL2";

export const mapRetreatFromD2 = (dhis2RetreatOption) => {
  let attributeIdToValueMap = {};
  dhis2RetreatOption.attributeValues?.forEach((attribute) => {
    attributeIdToValueMap[attribute.attribute.id] = attribute.value;
  });

  return {
    id: dhis2RetreatOption.id,
    name: dhis2RetreatOption.name,
    code: dhis2RetreatOption.code,
    date: new Date(attributeIdToValueMap[DHIS2_RETREAT_DATE_ATTRIBUTE]),
    disabled: attributeIdToValueMap[DHIS2_RETREAT_DISABLED_ATTRIBUTE],
    location: attributeIdToValueMap[DHIS2_RETREAT_LOCATION_ATTRIBUTE],
    totalYogis: attributeIdToValueMap[DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE],
  };
};
