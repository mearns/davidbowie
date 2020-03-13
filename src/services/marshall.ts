import { readFile, writeFile } from "./fs";
import path from "path";
import yaml from "js-yaml";
import { ChangeLog } from "../domain/change-log";
import { validate } from "./validator";
import { InternalError, UnsupportedFileExtensionError } from "../errors";

export enum SupportedFormat {
  yaml = "YAML",
  json = "JSON"
}

const SUPPORTED_EXTENSIONS: { [ext: string]: SupportedFormat } = Object.freeze({
  yaml: SupportedFormat.yaml,
  yml: SupportedFormat.yaml,
  json: SupportedFormat.json
});

export async function writeToFile(
  changeLog: ChangeLog,
  pathToFile: string,
  format: SupportedFormat = chooseFormat(pathToFile)
): Promise<void> {
  return writeFile(pathToFile, serialize(format, changeLog), "utf-8");
}

export async function loadFromFile(
  pathToFile: string,
  format: SupportedFormat = chooseFormat(pathToFile)
): Promise<ChangeLog> {
  const fileData: string = await readFile(pathToFile, "utf-8");
  return validate(deserialize(format, fileData));
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
