import * as TJS from "typescript-json-schema";
import path from "path";

const program = TJS.programFromConfig(
  path.resolve(__dirname, "..", "tsconfig.json")
);

const schema = TJS.generateSchema(program, "ChangeLog");

export default schema;
