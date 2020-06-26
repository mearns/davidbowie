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

async function access(path: fs.PathLike, mode: number): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.access(path, mode, (error: NodeJS.ErrnoException) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function fileExists(path: fs.PathLike): Promise<boolean> {
  try {
    await access(path, fs.constants.F_OK);
  } catch (error) {
    if (error.syscall === "access" && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
  return true;
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
