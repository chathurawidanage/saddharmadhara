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
import { 
  Retreat, 
  Room, 
  Language, 
  Attendance, 
  ParticipationSummary, 
  EoiSummary,
  SelectionState,
  InvitationState
} from "../types/domain";
import { Dhis2SqlViewResponse, Dhis2OptionSetResponse, Dhis2Option } from "../types/dhis2";

/**
 * Transformers for DHIS2 responses
 */

export const transformRetreats = (retreatsResponse: Dhis2SqlViewResponse): Retreat[] => {
  let retreats = retreatsResponse?.listGrid?.rows?.map((row: any[]) => {
    let attributeIdToValueMap = JSON.parse(row[3]);
    let dateStr = attributeIdToValueMap[DHIS2_RETREAT_DATE_ATTRIBUTE];
    let date = dateStr ? new Date(dateStr) : new Date();
    let noOfDays = attributeIdToValueMap[DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE];
    let endDate = getRetreatEndDate(date, noOfDays) || date;
    
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

  retreats?.sort((a: Retreat, b: Retreat) => a.date.getTime() - b.date.getTime());

  return retreats || [];
};

export const transformRooms = (roomResponse: Dhis2OptionSetResponse): Room[] => {
  return (
    roomResponse?.options?.map((room: Dhis2Option) => {
      let attributeIdToValueMap: Record<string, string> = {};
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

export const transformLanguages = (languagesResponse: Dhis2OptionSetResponse): Language[] => {
  return (
    languagesResponse?.options?.map((language: Dhis2Option) => {
      return {
        code: language.code,
        name: language.name,
      };
    }) || []
  );
};

export const transformAttendance = (attendanceResponse: Dhis2OptionSetResponse): Attendance[] => {
  return (
    attendanceResponse?.options?.map((attendance: Dhis2Option) => {
      return {
        code: attendance.code,
        name: attendance.name,
      };
    }) || []
  );
};

export const transformParticipationSummary = (summaryResponse: Dhis2SqlViewResponse): ParticipationSummary[] => {
  return (
    summaryResponse?.listGrid?.rows?.map(([yogiUid, retreatCode]) => ({
      yogiUid,
      retreatCode,
    })) || []
  );
};

export const transformEoiSummary = (summaryResponse: Dhis2SqlViewResponse): EoiSummary[] => {
  return (
    summaryResponse?.listGrid?.rows?.map(
      ([yogiUid, retreatCode, state, invitationSent]) => ({
        yogiUid,
        retreatCode,
        state: state as SelectionState,
        invitationSent: invitationSent as InvitationState,
      }),
    ) || []
  );
};
