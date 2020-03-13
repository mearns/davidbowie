import { ValidatorResult, ValidationError } from "jsonschema";

/**
 * Base class for all errors caused by the caller or external
 * files, as opposed to internal errors caused by bugs in the
 * code.
 */
export class ExternalError extends Error {
  constructor(name: string, message?: string) {
    super(message);
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalError extends Error {
  [name: string]: unknown;
  constructor(message: string, props: { [name: string]: unknown } = {}) {
    super(message);
    this.name = "InternalError";
    Error.captureStackTrace(this, this.constructor);
    Object.assign(this, props);
  }
}

export class ChangeLogValidationError extends ExternalError {
  errors: Array<ValidationError>;

  constructor(errors: Array<ValidationError>) {
    super(
      "ChangeLogValidationError",
      `Detected ${errors.length} error${
        errors.length === 1 ? "" : "s"
      } in changelog: ${errors.map(e => e.stack).join(", ")}`
    );
    this.stack =
      this.stack +
      `\n  caused by: ` +
      errors.map(e => e.stack).join("\n        and: ");
    this.errors = errors;
  }
}

export class UnsupportedFileExtensionError extends ExternalError {
  extension: string;
  filepath: string;
  supportedExtensions: Array<string>;
  constructor(filepath, extension, supportedExtensions) {
    super(
      "UnsupportedFileExtensionError",
      `Unsupported file extension ${extension}: the following are supported: ${supportedExtensions.join(
        ", "
      )}`
    );
    this.filepath = filepath;
    this.extension = extension;
    this.supportedExtensions = supportedExtensions;
  }
}
