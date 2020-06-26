import {
  isUnknownObject,
  isOptionalArrayOf,
  isOptionalText,
  Text
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
  FIXED = "fixed",
  MADE_IRRELEVANT = "made irrelevant"
}

export function isIssueEventType(x: unknown): x is IssueEventType {
  return (
    x === IssueEventType.INTRODUCED ||
    x === IssueEventType.WORKED_ON ||
    x === IssueEventType.FIXED ||
    x === IssueEventType.MADE_IRRELEVANT
  );
}

export interface IssueEvent {
  /**
   * A URL representing the issue. For instance, a [CVE](https://cve.mitre.org/) URL or a
   * URL for the issue in your issue tracker.
   */
  url: string;

  /**
   * What affect did the change have on this issue.
   */
  event: IssueEventType;

  /**
   * A summary of the issue and what the change was in regards to this issue.
   */
  summary?: Text;
}

export function isIssueEvent(x: unknown): x is IssueEvent {
  return (
    isUnknownObject(x) &&
    typeof x.url === "string" &&
    isIssueEventType(x.event) &&
    isOptionalText(x.summary)
  );
}

export interface Change {
  /**
   * A short summary of, or title for, the change.
   */
  summary?: Text;

  /**
   * A more detailed description of the change.
   */
  description?: Text;

  /**
   * An array of the commit IDs that are relevant to the change.
   */
  commits?: Array<string>;

  /**
   * The compatibility impact of the change.
   */
  compatibility: Compatibility;

  /**
   * An array of issues that are impacted by this change.
   */
  issues?: Array<IssueEvent>;
}

export function isChange(x: unknown): x is Change {
  return (
    isUnknownObject(x) &&
    isOptionalArrayOf(e => typeof e === "string", x.commits) &&
    isOptionalText(x.summary) &&
    isOptionalText(x.description) &&
    isCompatibility(x.compatibility) &&
    isOptionalArrayOf(isIssueEvent, x.issues)
  );
}
