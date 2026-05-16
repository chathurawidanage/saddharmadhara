export type RetreatType = "residential" | "online" | string;
export type RetreatMedium = "sinhala" | "english" | string;

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
  retreatType: RetreatType;
  noOfDays: string;
  medium: RetreatMedium;
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

export type SelectionState =
  | "SELECTED"
  | "RESERVED"
  | "NOT_SELECTED"
  | "PENDING"
  | string;

export type InvitationState = "SENT" | "NOT_SENT" | string;

export interface ExpressionOfInterest {
  eventId: string;
  state: SelectionState;
  invitationSent: InvitationState;
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

export interface YogiAttributes extends Record<string, string | undefined> {
  fullName?: string;
  gender?: string;
  mobile?: string;
  maritalState?: string;
  nic?: string;
  passport?: string;
  dob?: string;
  priority?: string;
  hasKids?: string;
  hasKidsComment?: string;
  hasPermission?: string;
  hasPermissionComment?: string;
  hasUnattendedDeformities?: string;
  hasUnattendedDeformitiesComment?: string;
  hasStress?: string;
  hasStressComment?: string;
}

export interface Yogi {
  id: string;
  active: boolean;
  attributes: YogiAttributes;
  /** Keyed by retreatCode */
  expressionOfInterests: Record<string, ExpressionOfInterest>;
  specialComments: SpecialComment[];
  /** Keyed by retreatCode */
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
  state: SelectionState;
  invitationSent: InvitationState;
}
