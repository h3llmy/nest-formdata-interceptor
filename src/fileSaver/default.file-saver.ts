import path from "path";
import { FileData, IFileSaver } from "../interfaces/file.interface";
import fs from "fs";

/**
 * Default implementation of the IFileSaver interface.
 * This class is responsible for saving file data to the filesystem.
 */
export class DefaultFileSaver implements IFileSaver {
  /**
   * Saves the provided file data to the specified file path.
   * Ensures the directory exists and writes the file buffer to the file path.
   *
   * @param fileData - The file data to save.
   * @returns The file path where the file was saved.
   */
  save(fileData: FileData): string {
    const directory = path.dirname(fileData.filePath);

    // Ensure the directory exists
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Write the file buffer to the specified file path
    fs.writeFileSync(fileData.filePath, fileData.buffer);

    return fileData.filePath;
  }
}
