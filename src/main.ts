import { loadFromFile, findChangeLogFile } from "./services/marshall";
import { ChangeLog } from "./domain/change-log";

async function main(): Promise<void> {
  const filepath: string = await findChangeLogFile();
  const x: ChangeLog = await loadFromFile(filepath);
  console.log(JSON.stringify(x, null, 4));
}

main();
