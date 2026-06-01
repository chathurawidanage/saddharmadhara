export interface Dhis2Engine {
  mutate: (mutation: object, options?: object) => Promise<any>;
  query: (query: object, options?: object) => Promise<any>;
}

export interface Dhis2AttributeValue {
  attribute: {
    id: string;
  };
  value: string | number | boolean;
}

export interface Dhis2Option {
  id: string;
  code: string;
  name: string;
  attributeValues?: Dhis2AttributeValue[];
}

export interface Dhis2OptionSet {
  id: string;
  name: string;
  options: Dhis2Option[];
}

export interface Dhis2OptionSetResponse {
  options: Dhis2Option[];
}

export interface Dhis2ListGrid {
  headers: Array<{
    name: string;
    column: string;
    type: string;
    hidden: boolean;
    meta: boolean;
  }>;
  rows: (string | number | boolean | null)[][];
}

export interface Dhis2SqlViewResponse {
  listGrid: Dhis2ListGrid;
}

export interface Dhis2TrackerEvent {
  event: string;
  trackedEntity: string;
  occurredAt: string;
  programStage: string;
  dataValues: Array<{
    dataElement: string;
    value: string;
  }>;
}

export interface Dhis2TrackerEventsResponse {
  instances: Dhis2TrackerEvent[];
}

export interface Dhis2Enrollment {
  status: string;
  notes: Array<{ value: string; createdBy: { username: string } }>;
  events: Dhis2TrackerEvent[];
}

export interface Dhis2TrackedEntityInstance {
  trackedEntity: string;
  attributes: Array<{
    attribute: string;
    value: string;
  }>;
  enrollments: Dhis2Enrollment[];
}
