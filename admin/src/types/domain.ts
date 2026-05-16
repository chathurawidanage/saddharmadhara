/**
 * Core domain types for the Saddharmadhara admin application.
 */

export interface Retreat {
  id: string;
  code: string;
  name: string;
  current: boolean;
  retreatCode: string;
  date: Date;
  endDate: Date;
  disabled: boolean;
  location: string;
  totalYogis: string;
  retreatType: string;
  noOfDays: string;
  medium: string;
  finalized: boolean;
}

export interface Room {
  code: string;
  name: string;
  location: string;
  floor: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface MetadataOption {
  code: string;
  name: string;
}

export interface Attendance {
  code: string;
  name: string;
}

export interface ExpressionOfInterest {
  eventId: string;
  state: string;
  invitationSent: string;
  occurredAt: string;
}

export interface Participation {
  eventId: string;
  attendance?: string;
  room?: string;
  retreat: string;
  specialComment?: string;
  occurredAt: string;
}

export interface SpecialComment {
  eventId: string;
  comment: string;
  occurredAt: string;
}

export interface Note {
  value: string;
  createdBy: {
    username: string;
  };
}

export interface Yogi {
  id: string;
  active: boolean;
  attributes: Record<string, string>;
  expressionOfInterests: Record<string, ExpressionOfInterest>;
  specialComments: SpecialComment[];
  participation: Record<string, Participation>;
  notes: Note[];
}

export interface ParticipationSummary {
  yogiUid: string;
  retreatCode: string;
}

export interface EoiSummary {
  yogiUid: string;
  retreatCode: string;
  invitationSent: boolean;
}

export type SelectionState = "SELECTED" | "RESERVED" | "NOT_SELECTED" | "PENDING";
