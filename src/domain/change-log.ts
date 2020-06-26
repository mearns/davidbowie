import {
  isUnknownObject,
  isOptionalText,
  isOptionalArrayOf,
  Text
} from "../services/type-utils";
import { Change, isChange } from "./change";
import { SemVer } from "semver";
import { types } from "util";
import { isVersion } from "../services/versions";

export interface ReleaseContents {
  changes?: Array<Change>;
  summary?: Text;
  description?: Text;
}

export function isReleaseContents(x: unknown): x is ReleaseContents {
  return (
    isUnknownObject(x) &&
    isOptionalArrayOf(isChange, x.changes) &&
    isOptionalText(x.summary) &&
    isOptionalText(x.description)
  );
}

export interface Release extends ReleaseContents {
  release: number;
  version: SemVer | string;
  date: Date;
}

export function isRelease(x: unknown): x is Release {
  return (
    isReleaseContents(x) &&
    isUnknownObject(x) &&
    isVersion(x.version) &&
    types.isDate(x.date)
  );
}

export interface ChangeLog {
  preRelease?: ReleaseContents;
  releases?: Array<Release>;
}

export function isChangeLog(x: unknown): x is ChangeLog {
  return (
    isUnknownObject(x) &&
    (typeof x.preRelease === "undefined" || isReleaseContents(x.preRelease)) &&
    isOptionalArrayOf<Release>(isRelease, x.releases)
  );
}
