import { readFile, writeFile } from "./fs";
import * as changeLog from "../domain/change-log";
import path from "path";
import yaml from "js-yaml";
import schema from "../schema";
import { Validator } from "jsonschema";
import { ChangeLog } from "./change-log";
import { valid } from "semver";

const validator: Validator = new Validator();

export enum SupportedFormat {
  yaml = "YAML",
  json = "JSON"
}

export async function writeToFile(
  changeLog: ChangeLog,
  pathToFile: string,
  format: SupportedFormat = chooseFormat(pathToFile)
) {
  return writeFile(pathToFile, serialize(format, changeLog), "utf-8");
}

export async function loadFromFile(
  pathToFile: string,
  format: SupportedFormat = chooseFormat(pathToFile)
): Promise<changeLog.ChangeLog> {
  const fileData: string = await readFile(pathToFile, "utf-8");
  return validate(deserialize(format, fileData));
}

function validate(contents: any): changeLog.ChangeLog {
  const results = validator.validate(contents, schema);
  if (results.errors.length) {
    throw Object.assign(
      new Error(
        `Validation errors found in change-log. Error count: ${results.errors.length}`
      ),
      { errors: results.errors }
    );
  }
  return new ChangeLog(contents);
}

function deserialize(format: SupportedFormat, data: string): any {
  switch (format) {
    case SupportedFormat.yaml:
      return yaml.safeLoad(data);

    case SupportedFormat.json:
      return JSON.parse(data);

    default:
      throw new Error(`Unsupported SupportedFormat: ${format}`);
  }
}

function serialize(format: SupportedFormat, data: ChangeLog): string {
  switch (format) {
    case SupportedFormat.yaml:
      return yaml.safeDump(data);

    case SupportedFormat.json:
      return JSON.stringify(data, null, 4);

    default:
      throw new Error(`Unsupported SupportedFormat: ${format}`);
  }
}

function chooseFormat(pathToFile: string): SupportedFormat {
  const ext = path.extname(pathToFile).toLowerCase();
  switch (ext) {
    case ".yaml":
    case ".yml":
      return SupportedFormat.yaml;

    case ".json":
      return SupportedFormat.json;

    default:
      throw new Error(`Unknown file extension: ${pathToFile}`);
  }
}
