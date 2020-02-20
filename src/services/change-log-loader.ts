import { readFile } from "./fs";
import { ChangeLog } from "../domain/change-log";
import path from "path";
import yaml from "js-yaml";
import schema from "../schema";
import { Validator, Schema } from "jsonschema";

const validator: Validator = new Validator();

export enum SupportedFormat {
  yaml = "YAML",
  json = "JSON"
}

export async function loadFromFile(
  pathToFile: string,
  type: SupportedFormat = chooseFormat(pathToFile)
): Promise<void> {
  const fileData: string = await readFile(pathToFile, "utf-8");
  const parsedContents: any = deserialize(type, fileData);
  const results = validator.validate(parsedContents, (schema as any) as Schema);
  console.log(results);
}

function deserialize(type: SupportedFormat, data: string): any {
  switch (type) {
    case SupportedFormat.yaml:
      return yaml.safeLoad(data);

    case SupportedFormat.json:
      return JSON.parse(data);

    default:
      throw new Error(`Unsupported SupportedFormat: ${type}`);
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
