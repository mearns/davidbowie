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

export enum IssueEventType {
  INTRODUCED = "introduced",
  WORKED_ON = "worked on",
  FIXED = "fixed"
}

export interface IssueEvent {
  readonly url: string;
  readonly event: IssueEventType;
  readonly summary?: string;
}

export interface Change {
  readonly commits?: ReadonlyArray<string>;
  readonly summary?: string;
  readonly description?: string;
  readonly compatibility: Compatibility;
  readonly issues?: ReadonlyArray<IssueEvent>;
}
