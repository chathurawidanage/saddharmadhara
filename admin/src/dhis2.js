export const DHIS_PROGRAM = "KdYt2OP9VjD";

export const DHIS_RETREATS_OPTION_SET_ID = "ys2Pv9hTS0O";
export const DHIS_RETREAT_SELECTION_STATE_OPTION_SET_ID = "ECk38BLpbn9";

export const DHIS2_RETREAT_DATE_ATTRIBUTE = "sCzsZZ7m37E";
export const DHIS2_RETREAT_DISABLED_ATTRIBUTE = "hp92k6RhLJS";
export const DHIS2_RETREAT_LOCATION_ATTRIBUTE = "TuaBW7iXTGw";
export const DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE = "DkyFJvcKgL2";
export const DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE = "vl3IQiIavWD";

export const DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE = "BLn1j2VgLZf";
export const DHIS2_RETREAT_DATA_ELEMENT = "rYqV3VQu7LS";
export const DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT = "MVaziT78i7p";

export const DHIS2_TEI_ATTRIBUTE_FULL_NAME = "fvk2p04ylAA";
export const DHIS2_TEI_ATTRIBUTE_GENDER = "tuKFO1uF5x5";
export const DHIS2_TEI_ATTRIBUTE_MOBILE = "lLXB9cYYgEP";

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
