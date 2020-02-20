import { Version } from "../domain/change-log";
import { SemVer } from "semver";

export function parseVersion(versionString: string): Version {
  const semver = new SemVer(versionString);
  return {
    majorVersion: semver.major,
    minorVersion: semver.minor,
    patchVersion: semver.patch,
    preReleaseIdentifiers: semver.prerelease.map(String)
  };
}
