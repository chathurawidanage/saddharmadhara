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
  season?: string;
}

export interface Season {
  id: string;
  code: string;
  name: string;
  startDate: Date | null;
  retreatType: string;
  noOfDays?: string;
  medium?: string;
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

export enum SelectionState {
  SELECTED = "selected",
  PENDING = "pending",
  APPLIED = "applied",
  WAITING = "waiting",
  DESELECTED = "deselected",
  UNATTENDING = "unattending",
  UNCONFIRMED = "unconfirmed",
}

export enum InvitationState {
  SENT = "sent",
  NOT_SENT = "not_sent",
  FAILED = "failed",
  DELIVERED = "delivered",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export enum MaritalState {
  REVEREND = "reverend",
  SINGLE = "single",
  MARRIED = "married",
  WIDOWED = "widowed",
  DIVORCED = "divorced",
}

export enum YogiPriority {
  TRUST_MEMBER = "trust_member",
  TRUST_MEMBERS_FAMILY = "trust_members_family",
}

export enum AttendanceState {
  ATTENDED = "attended",
  ABSENT = "absent",
  NOSHOW = "noshow",
}

export interface ExpressionOfInterest {
  eventId: string;
  state: SelectionState;
  invitationSent: InvitationState;
  occurredAt: string;
}

export interface Participation {
  eventId: string;
  attendance?: AttendanceState;
  room?: string;
  retreat: string;
  specialComment?: string;
  occurredAt: string;
}

export interface YogiAttributes extends Record<string, any> {
  fullName?: string;
  gender?: Gender;
  mobile?: string;
  maritalState?: MaritalState;
  nic?: string;
  passport?: string;
  dob?: string;
  priority?: YogiPriority;
  hasKids?: boolean;
  hasKidsComment?: string;
  hasPermission?: boolean;
  hasPermissionComment?: string;
  hasUnattendedDeformities?: boolean;
  hasUnattendedDeformitiesComment?: string;
  hasStress?: boolean;
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
