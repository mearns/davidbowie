import * as TJS from "typescript-json-schema";
import path from "path";
import { Schema } from "jsonschema";

const program = TJS.programFromConfig(
  path.resolve(__dirname, "..", "tsconfig.json")
);

const schema: Schema = (TJS.generateSchema(
  program,
  "ChangeLog"
) as unknown) as Schema;

export default schema;
