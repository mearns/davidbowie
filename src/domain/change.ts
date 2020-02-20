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

export interface VersionObject {
  /**
   * Indicates the major version number.
   * @minimum 0
   * @TJS-type integer
   */
  readonly majorVersion: number;

  /**
   * Indicates the minor version number.
   * @minimum 0
   * @TJS-type integer
   */
  readonly minorVersion: number;

  /**
   * Indicates the patch version number.
   * @minimum 0
   * @TJS-type integer
   */
  readonly patchVersion: number;

  /**
   * A sequence of pre-release identifiers.
   */
  readonly preReleaseIdentifiers?: Array<string>;
}

export type Version = VersionObject | string;

export enum IssueEvent {
  INTRODUCED = "introduced",
  WORKED_ON = "worked on",
  FIXED = "fixed"
}

export interface Change {
  readonly commits?: Array<string>;
  readonly summary?: string;
  readonly description?: string;
  readonly compatibility: Compatibility;
}

export interface IssueChange extends Change {
  readonly issueUrl: string;
  readonly issueEvent: IssueEvent;
  readonly issueSummary?: string;
}
