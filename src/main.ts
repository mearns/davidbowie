import { loadFromFile } from "./services/marshall";
import path from "path";
import { ChangeLog } from "./domain/change-log";

async function main(): Promise<void> {
  const x: ChangeLog = await loadFromFile(
    path.resolve(__dirname, "..", "CHANGES.yaml")
  );
  console.log(JSON.stringify(x, null, 4));
}

main();
