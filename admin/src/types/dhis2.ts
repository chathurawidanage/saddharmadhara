export interface Dhis2Engine {
  mutate: (mutation: any, options?: any) => Promise<any>;
  query: (query: any, options?: any) => Promise<any>;
}

export interface Dhis2AttributeValue {
  attribute: {
    id: string;
  };
  value: any;
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
  rows: any[][];
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
  notes: any[];
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
