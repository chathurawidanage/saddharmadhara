import { SelectionState, Gender, MaritalState, YogiPriority } from "../types/domain";

export interface SchemaMismatch {
  type: "MISSING_IN_ENUM" | "MISSING_ON_SERVER";
  optionSetId: string;
  optionSetName: string;
  code: string;
}

/**
 * Validates a list of options from a DHIS2 OptionSet against a frontend string enum.
 * Returns a list of mismatches found.
 */
export const validateOptionSet = (
  optionSetId: string,
  optionSetName: string,
  serverOptions: { code: string }[],
  clientEnum: Record<string, string>,
): SchemaMismatch[] => {
  const mismatches: SchemaMismatch[] = [];
  const serverCodes = new Set(serverOptions.map(opt => opt.code.toLowerCase()));
  const clientValues = new Set(Object.values(clientEnum).map(val => val.toLowerCase()));

  // 1. Check if server has options that are not in our frontend enum (missing in enum)
  serverOptions.forEach(opt => {
    if (!clientValues.has(opt.code.toLowerCase())) {
      mismatches.push({
        type: "MISSING_IN_ENUM",
        optionSetId,
        optionSetName,
        code: opt.code,
      });
    }
  });

  // 2. Check if frontend enum has options that do not exist on the server (missing on server)
  Object.values(clientEnum).forEach(value => {
    if (!serverCodes.has(value.toLowerCase())) {
      mismatches.push({
        type: "MISSING_ON_SERVER",
        optionSetId,
        optionSetName,
        code: value,
      });
    }
  });

  return mismatches;
};
