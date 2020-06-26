import { readFile, writeFile, fileExists } from "./fs";
import yaml from "js-yaml";
import { ChangeLog } from "../domain/change-log";
import { validate } from "./validator";
import {
  InternalError,
  UnsupportedFileExtensionError,
  MultipleChangeLogsFoundError
} from "../errors";
import { TypeGuard } from "./type-utils";
import path from "path";

export enum SupportedFormat {
  yaml = "YAML",
  json = "JSON"
}

const SUPPORTED_EXTENSIONS: { [ext: string]: SupportedFormat } = Object.freeze({
  yaml: SupportedFormat.yaml,
  yml: SupportedFormat.yaml,
  json: SupportedFormat.json
});

const STANDARD_FILENAMES: Array<string> = [
  "CHANGES.yaml",
  "CHANGES.yml",
  "CHANGES.json"
];

export async function writeToFile(
  changeLog: ChangeLog,
  pathToFile: string,
  format: SupportedFormat = chooseFormat(pathToFile)
): Promise<string> {
  const contents: string = serialize(format, changeLog);
  await writeFile(pathToFile, contents, "utf-8");
  return contents;
}

export async function loadFromFile(
  pathToFile: string,
  format: SupportedFormat = chooseFormat(pathToFile)
): Promise<ChangeLog> {
  const fileData: string = await readFile(pathToFile, "utf-8");
  return validate(deserialize(format, fileData));
}

/**
 * Attempt to find a CHANGELOG file, starting in the specified directory and
 * walking up until we find one or get to the root of the filesystem. Returns the
 * absolute path to the first (lowest) CHANGELOG found, or null if none was found.
 * If multiple were found in the same directory, throws an error.
 */
export async function findChangeLogFile(
  bottomDir = "."
): Promise<string | null> {
  let dir = path.normalize(bottomDir);
  while (true) {
    const found = await findChangeLogFileInDir(dir);
    if (found) {
      return found;
    }
    const nextDir = path.resolve(dir, "..");
    if (nextDir === dir) {
      return null;
    }
    dir = nextDir;
  }
}

/**
 * Searches a single directory for a CHANGELOG file using one of the standard paths.
 * If exactly one is found, returns the absolute path to it. If none are found, returns
 * null and if more than one are found an error is thrown.
 */
export async function findChangeLogFileInDir(
  dir: string
): Promise<string | null> {
  const existingPaths: Array<string> = (
    await Promise.all(
      STANDARD_FILENAMES.map((potentialPath: string) =>
        path.resolve(dir, potentialPath)
      ).map(async (absPath: string) => {
        if (await fileExists(absPath)) {
          return absPath;
        }
        return false;
      })
    )
  ).filter((p => typeof p === "string") as TypeGuard<string, false>);
  if (existingPaths.length === 0) {
    return null;
  } else if (existingPaths.length === 1) {
    const [foundPath] = existingPaths;
    return foundPath;
  } else {
    throw new MultipleChangeLogsFoundError(dir, existingPaths);
  }
}

function deserialize(format: SupportedFormat, data: string): unknown {
  switch (format) {
    case SupportedFormat.yaml:
      return yaml.safeLoad(data);

    case SupportedFormat.json:
      return JSON.parse(data);

    default:
      throw new InternalError(`Unsupported SupportedFormat: ${format}`, {
        format,
        SupportedFormat
      });
  }
}

function serialize(format: SupportedFormat, data: ChangeLog): string {
  switch (format) {
    case SupportedFormat.yaml:
      return yaml.safeDump(data);

    case SupportedFormat.json:
      return JSON.stringify(data, null, 4);

    default:
      throw new InternalError(`Unsupported SupportedFormat: ${format}`, {
        format,
        SupportedFormat
      });
  }
}

function chooseFormat(pathToFile: string): SupportedFormat {
  const suffix = path.extname(pathToFile).toLowerCase();
  const [, ext] = suffix.match(/^\.(.*)$/) || [null, suffix];
  const format: SupportedFormat | undefined = SUPPORTED_EXTENSIONS[ext];
  if (typeof format === "undefined") {
    throw new UnsupportedFileExtensionError(
      pathToFile,
      ext,
      Object.keys(SUPPORTED_EXTENSIONS)
    );
  }
  return format;
}
