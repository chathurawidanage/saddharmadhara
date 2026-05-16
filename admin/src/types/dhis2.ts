/**
 * Minimal interfaces for DHIS2 App Runtime objects
 */

export interface Dhis2Engine {
  mutate: (mutation: any, options?: any) => Promise<any>;
  query: (query: any, options?: any) => Promise<any>;
}

export interface DataQuery {
  [key: string]: {
    resource: string;
    id?: string | ((variables: any) => string);
    params?: any | ((variables: any) => any);
  };
}

export interface DataMutation {
  resource: string;
  type: "create" | "update" | "delete" | "replace";
  id?: string | ((variables: any) => string);
  data?: any | ((variables: any) => any);
}
