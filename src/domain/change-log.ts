import { Change } from "./change";

export interface Version {
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

export interface ReleaseContents {
  readonly changes: ReadonlyArray<Change>;
  readonly summary?: string;
  readonly description?: string;
}

export interface Release extends ReleaseContents {
  readonly release: number;
  readonly version: Version | string;
  readonly date: Date;
}

export interface ChangeLog {
  readonly preRelease?: ReleaseContents;
  readonly releases?: ReadonlyArray<Release>;
}
