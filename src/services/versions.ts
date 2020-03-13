import { SemVer, valid } from "semver";
export { SemVer } from "semver";

export type Version = SemVer | string;

export function parseVersion(version: Version): Version {
  if (isSemVer(version)) {
    return version;
  }
  return new SemVer(version);
}

export function isSemVer(x: unknown): x is SemVer {
  return x instanceof SemVer;
}

export function isVersion(x: unknown): x is Version {
  return isSemVer(x) || (typeof x === "string" && valid(x) !== null);
}
