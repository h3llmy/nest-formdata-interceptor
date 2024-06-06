import path from "path";
import {
  DefaultFileSaverOptions,
  FileData,
  IFileSaver,
} from "../interfaces/file.interface";
import fs from "fs";
import { ExecutionContext } from "@nestjs/common";

/**
 * Default implementation of the IFileSaver interface.
 * This class is responsible for saving file data to the filesystem.
 */
export class DefaultFileSaver implements IFileSaver {
  constructor(private readonly options?: DefaultFileSaverOptions) {
    this.options = this.options ?? {};
    this.options.prefixDirectory = this.options?.prefixDirectory ?? "./public";
  }

  /**
   * Saves the provided file data to the specified file path.
   * Ensures the directory exists and writes the file buffer to the file path.
   *
   * @param fileData - The file data to save.
   * @returns The file path where the file was saved.
   */
  public save(fileData: FileData, context: ExecutionContext): string {
    const directory = this.options.customDirectory
      ? this.options.customDirectory(context, this.options.prefixDirectory)
      : this.options.prefixDirectory;

    const filePath = path
      .join(directory, fileData.fileNameFull)
      .replace(/\\/g, "/");

    // Ensure the directory exists
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Write the file buffer to the specified file path
    fs.writeFileSync(filePath, fileData.buffer);

    return filePath;
  }
}
