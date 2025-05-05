import path from "path";
import fs from "fs";
import { ExecutionContext } from "@nestjs/common";
import {
  IFileSaver,
  ILocalFileSaverOptions,
} from "../interfaces/file.interface";
import { FileData } from "../classes/FileData";
import { DEFAULT_FILE_SAVER_OPTION } from "../config/defaultFileSaver.config";

/**
 * Default implementation of the IFileSaver interface.
 * This class is responsible for saving file data to the filesystem.
 */
export class LocalFileSaver implements IFileSaver {
  /**
   * Constructs a new instance of the LocalFileSaver class.
   * @param options - Optional configuration options for the file saver.
   */
  constructor(private readonly options?: ILocalFileSaverOptions) {
    this.options = { ...DEFAULT_FILE_SAVER_OPTION, ...options };
  }

  /**
   * Saves the provided file data to the specified file path.
   * Ensures the directory exists and writes the file buffer to the file path.
   * @param fileData - The file data to save.
   * @param context - The execution context, typically provided by NestJS.
   * @param options - Optional configuration for the file path and directory.
   * @returns The file path where the file was saved.
   */
  public save(
    fileData: FileData,
    context: ExecutionContext,
    options?: ILocalFileSaverOptions,
  ): string {
    // Determine the directory where the file will be saved.
    const directory = this.options.customDirectory
      ? this.options.customDirectory(context, this.options.prefixDirectory)
      : this.options.prefixDirectory;

    const fullDirectory = path
      .join(...[directory, options?.path].filter(Boolean))
      .replace(/\\/g, "/");

    // Construct the full file path, ensuring platform-independent path separators.
    const filePath = path
      .join(fullDirectory, fileData.fileNameFull)
      .replace(/\\/g, "/");

    // Ensure the directory exists, creating it recursively if necessary.
    if (!fs.existsSync(fullDirectory)) {
      fs.mkdirSync(fullDirectory, { recursive: true });
    }

    // Write the file buffer to the specified file path.
    fs.writeFileSync(filePath, fileData.buffer);

    // Return the file path where the file was saved.
    return filePath;
  }
}
