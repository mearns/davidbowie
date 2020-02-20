import fs from "fs";

export async function readFile(
  path: string,
  encoding: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (error: Error, data: string): void => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}
