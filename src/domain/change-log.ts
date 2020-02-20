import { Change, Version } from "./change";

export interface ReleaseContents {
  readonly changes: Array<Change>;
  readonly summary?: string;
  readonly description?: string;
}

export interface Release extends ReleaseContents {
  readonly release: number;
  readonly version: Version;
  readonly date: Date;
}

export interface ChangeLog {
  readonly preRelease?: ReleaseContents;
  readonly releases?: Array<Release>;
}
