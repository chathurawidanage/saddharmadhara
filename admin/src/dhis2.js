export const DHIS_PROGRAM = "KdYt2OP9VjD";

export const DHIS2_ACTIVE_RETREATS_SQL_VIEW = "NyBDf8X8UxG";
export const DHIS_RETREATS_OPTION_SET_ID = "ys2Pv9hTS0O";
export const DHIS_RETREAT_SELECTION_STATE_OPTION_SET_ID = "ECk38BLpbn9";

export const DHIS_RETREAT_TYPE_OPTION_SET_ID = "Mk6tBQBCuGY";

export const DHIS2_RETREAT_DATE_ATTRIBUTE = "sCzsZZ7m37E";
export const DHIS2_RETREAT_DISABLED_ATTRIBUTE = "hp92k6RhLJS";
export const DHIS2_RETREAT_LOCATION_ATTRIBUTE = "TuaBW7iXTGw";
export const DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE = "DkyFJvcKgL2";
export const DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE = "vl3IQiIavWD";
export const DHIS2_RETREAT_TYPE_ATTRIBUTE = "AJZR2ji582g";

export const DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE = "BLn1j2VgLZf";
export const DHIS2_RETREAT_DATA_ELEMENT = "rYqV3VQu7LS";
export const DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT = "MVaziT78i7p";

export const DHIS2_TEI_ATTRIBUTE_FULL_NAME = "fvk2p04ylAA";
export const DHIS2_TEI_ATTRIBUTE_GENDER = "tuKFO1uF5x5";
export const DHIS2_TEI_ATTRIBUTE_MOBILE = "lLXB9cYYgEP";

export const DHIS2_TEI_ATTRIBUTE_HAS_KIDS = "Bpce3m4do80";
export const DHIS2_TEI_ATTRIBUTE_HAS_KIDS_COMMENT = "i3RptmIeSwR";

export const DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION = "QGXYhZMXfnc";
export const DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION_COMMENT = "QOGamVcvLPz";

export const DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFOMITIES = "RpNKpAufHbn";
export const DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFOMITIES_COMMENT = "HtW0OMmthFQ";

export const DHIS2_TEI_ATTRIBUTE_HAS_STRESS = "dgky5acnvG3";
export const DHIS2_TEI_ATTRIBUTE_HAS_STRESS_COMMENT = "Mp6LLGv4WOT";

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
    disabled:
      attributeIdToValueMap[DHIS2_RETREAT_DISABLED_ATTRIBUTE] === "true",
    location: attributeIdToValueMap[DHIS2_RETREAT_LOCATION_ATTRIBUTE],
    totalYogis: attributeIdToValueMap[DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE],
    retreatType: attributeIdToValueMap[DHIS2_RETREAT_TYPE_ATTRIBUTE],
    noOfDays: attributeIdToValueMap[DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE],
  };
};
