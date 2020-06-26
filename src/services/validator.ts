import { Validator, ValidatorResult } from "jsonschema";
import { ChangeLog, isChangeLog } from "../domain/change-log";
import schema from "../schema";
import { ChangeLogValidationError, InternalError } from "../errors";

const validator: Validator = new Validator();

/**
 * Validate and return a ChangeLog.
 * @throws {ChangeLogValidationError} if there are any validation errors
 * @param contents The parsed changelog
 */
export function validate(contents: unknown): ChangeLog {
  const results: ValidatorResult = validator.validate(contents, schema);
  if (results.errors.length) {
    throw new ChangeLogValidationError(results.errors);
  }
  if (isChangeLog(contents)) {
    return contents;
  }
  throw new InternalError(
    `ChangeLog contents passed validation, but not the typeguard`,
    { contents, validationResults: results }
  );
}
