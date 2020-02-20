import { loadFromFile } from "./services/change-log-loader";
import path from "path";

async function main() {
  const x: any = loadFromFile(path.resolve(__dirname, "..", "CHANGES.yaml"));
}

main();
