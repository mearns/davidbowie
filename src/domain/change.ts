import {
  isUnknownObject,
  isOptionalString,
  isOptionalArrayOf
} from "../services/type-utils";

export enum Compatibility {
  /**
   * Indicates a breaking change.
   */
  MAJOR = "Major",

  /**
   * Indicates a change which preserves backward compatibility but likely breaks forward compatibility.
   */
  MINOR = "minor",

  /**
   * Indicates a change which changes the behavior of the application, but preserves the interface and
   * contracts.
   */
  PATCH = "patch",

  /**
   * Indicates a change that has no impact on the behavior of the application, but changes associated files
   * such as READMEs or other documentation.
   */
  DOC = "doc"
}

export function isCompatibility(x: unknown): x is Compatibility {
  return (
    x === Compatibility.MAJOR ||
    x === Compatibility.MINOR ||
    x === Compatibility.PATCH ||
    x === Compatibility.DOC
  );
}

export enum IssueEventType {
  INTRODUCED = "introduced",
  WORKED_ON = "worked on",
  FIXED = "fixed"
}

export function isIssueEventType(x: unknown): x is IssueEventType {
  return (
    x === IssueEventType.INTRODUCED ||
    x === IssueEventType.WORKED_ON ||
    x === IssueEventType.FIXED
  );
}

export interface IssueEvent {
  url: string;
  event: IssueEventType;
  summary?: string;
}

export function isIssueEvent(x: unknown): x is IssueEvent {
  return (
    isUnknownObject(x) &&
    typeof x.url === "string" &&
    isIssueEventType(x.event) &&
    isOptionalString(x.summary)
  );
}

export interface Change {
  commits?: Array<string>;
  summary?: string;
  description?: string;
  compatibility: Compatibility;
  issues?: Array<IssueEvent>;
}

export function isChange(x: unknown): x is Change {
  return (
    isUnknownObject(x) &&
    isOptionalArrayOf(e => typeof e === "string", x.commits) &&
    isOptionalString(x.summary) &&
    isOptionalString(x.description) &&
    isCompatibility(x.compatibility) &&
    isOptionalArrayOf(isIssueEvent, x.issues)
  );
}
