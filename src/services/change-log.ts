import * as changeLog from "../domain/change-log";
import * as change from "../domain/change";
import { parseVersion } from "./versions";

export class ChangeLog implements changeLog.ChangeLog {
  readonly preRelease?: changeLog.ReleaseContents;
  readonly releases?: Array<changeLog.Release>;

  constructor(from: changeLog.ChangeLog = {}) {
    this.preRelease = new PreRelease(from.preRelease);
    this.releases = from.releases.map(r => new Release(r));
  }
}

class ReleaseContents implements changeLog.ReleaseContents {
  readonly summary?: string;
  readonly description?: string;
  readonly changes: Array<change.Change>;

  constructor(from: changeLog.ReleaseContents = { changes: [] }) {
    this.summary = from.summary;
    this.description = from.description;
    this.changes = from.changes.map(c => new Change(c));
  }
}

class PreRelease extends ReleaseContents {}

class Release extends ReleaseContents implements changeLog.Release {
  readonly release: number;
  readonly version: changeLog.Version;
  readonly date: Date;

  constructor(from: changeLog.Release) {
    super(from);
    this.release = from.release;
    this.date = from.date;
    this.version =
      typeof from.version === "string"
        ? parseVersion(from.version)
        : from.version;
  }
}

class Change implements change.Change {
  readonly compatibility: change.Compatibility;
  readonly summary?: string;
  readonly description?: string;
  readonly commits?: string[];
  readonly issues?: change.IssueEvent[];

  constructor(
    from: change.Change = { compatibility: change.Compatibility.MAJOR }
  ) {
    this.compatibility = from.compatibility;
    this.summary = from.summary;
    this.description = from.description;
    this.commits = [...from.commits];
    this.issues = from.issues.map(i => new IssueEvent(i));
  }
}

class IssueEvent implements change.IssueEvent {
  url: string;
  event: change.IssueEventType;
  summary?: string;

  constructor(from: change.IssueEvent) {
    this.url = from.url;
    this.summary = from.summary;
    this.event = from.event;
  }
}
