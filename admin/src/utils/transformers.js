import {
  DHIS2_RETREAT_CODE_ATTRIBUTE,
  DHIS2_RETREAT_DATE_ATTRIBUTE,
  DHIS2_RETREAT_DISABLED_ATTRIBUTE,
  DHIS2_RETREAT_LOCATION_ATTRIBUTE,
  DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE,
  DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE,
  DHIS2_RETREAT_TYPE_ATTRIBUTE,
  DHIS2_ROOMS_FLOOR_ATTRIBUTE,
  DHIS2_RETREAT_MEDIUM_ATTRIBUTE,
  DHIS2_RETREAT_FINALIZED_ATTRIBUTE,
} from "../dhis2";
import { getRetreatEndDate } from "./retreatUtils";

/**
 * Transformers for DHIS2 responses
 */

export const transformRetreats = (retreatsReponse) => {
  let retreats = retreatsReponse?.listGrid?.rows?.map((row) => {
    let attributeIdToValueMap = JSON.parse(row[3]);
    let date = new Date(attributeIdToValueMap[DHIS2_RETREAT_DATE_ATTRIBUTE]);
    let noOfDays = attributeIdToValueMap[DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE];
    let endDate = getRetreatEndDate(date, noOfDays);
    return {
      id: row[0],
      code: row[1],
      name: row[2],
      current: row[4] === "true",
      retreatCode: attributeIdToValueMap[DHIS2_RETREAT_CODE_ATTRIBUTE],
      date,
      endDate,
      disabled:
        attributeIdToValueMap[DHIS2_RETREAT_DISABLED_ATTRIBUTE] === "true",
      location: attributeIdToValueMap[DHIS2_RETREAT_LOCATION_ATTRIBUTE],
      totalYogis: attributeIdToValueMap[DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE],
      retreatType: attributeIdToValueMap[DHIS2_RETREAT_TYPE_ATTRIBUTE],
      noOfDays: attributeIdToValueMap[DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE],
      medium: attributeIdToValueMap[DHIS2_RETREAT_MEDIUM_ATTRIBUTE],
      finalized:
        attributeIdToValueMap[DHIS2_RETREAT_FINALIZED_ATTRIBUTE] === "true",
    };
  });

  retreats?.sort((a, b) => a.date - b.date);

  return retreats || [];
};

export const transformRooms = (roomResponse) => {
  return (
    roomResponse?.options?.map((room) => {
      let attributeIdToValueMap = {};
      room.attributeValues?.forEach((attribute) => {
        attributeIdToValueMap[attribute.attribute.id] = attribute.value;
      });
      return {
        code: room.code,
        name: room.name,
        location: attributeIdToValueMap[DHIS2_RETREAT_LOCATION_ATTRIBUTE],
        floor: attributeIdToValueMap[DHIS2_ROOMS_FLOOR_ATTRIBUTE],
      };
    }) || []
  );
};

export const transformLanguages = (languagesResponse) => {
  return (
    languagesResponse?.options?.map((language) => {
      return {
        code: language.code,
        name: language.name,
      };
    }) || []
  );
};

export const transformAttendance = (attendanceResponse) => {
  return (
    attendanceResponse?.options?.map((attendance) => {
      return {
        code: attendance.code,
        name: attendance.name,
      };
    }) || []
  );
};

export const transformParticipationSummary = (summaryResponse) => {
  return (
    summaryResponse?.listGrid?.rows?.map(([yogiUid, retreatCode]) => ({
      yogiUid,
      retreatCode,
    })) || []
  );
};

export const transformEoiSummary = (summaryResponse) => {
  return (
    summaryResponse?.listGrid?.rows?.map(
      ([yogiUid, retreatCode, invitationSent]) => ({
        yogiUid,
        retreatCode,
        invitationSent: invitationSent === "true",
      }),
    ) || []
  );
};
