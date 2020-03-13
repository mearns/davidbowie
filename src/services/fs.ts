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

export async function writeFile(
  path: string,
  content: string,
  encoding: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, encoding, (error: Error): void => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
