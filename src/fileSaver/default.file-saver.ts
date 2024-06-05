import path from "path";
import { FileData, IFileSaver } from "../interfaces/file.interface";
import fs from "fs";
import { ExecutionContext } from "@nestjs/common";

/**
 * Default implementation of the IFileSaver interface.
 * This class is responsible for saving file data to the filesystem.
 */
export class DefaultFileSaver implements IFileSaver {
  constructor(
    private readonly prefixDirectory: string = "public",
    private readonly customDirectory?: (
      context: ExecutionContext,
      originalDirectory: string
    ) => string
  ) {}

  /**
   * Saves the provided file data to the specified file path.
   * Ensures the directory exists and writes the file buffer to the file path.
   *
   * @param fileData - The file data to save.
   * @returns The file path where the file was saved.
   */
  save(fileData: FileData, context: ExecutionContext): string {
    const directory = this.customDirectory
      ? this.customDirectory(context, this.prefixDirectory)
      : this.prefixDirectory;

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
