import { MimeType } from "../interfaces/file.interface";

/**
 * Represents the data for a file.
 */
export class FileData {
  constructor(
    public originalFileName: string,
    public fileName: string,
    public fileNameFull: string,
    public encoding: string,
    public mimetype: MimeType,
    public fileExtension: string,
    public fileSize: number,
    public buffer: Buffer
  ) {}

  /**
   * Saves the file data to the data storage.
   */
  save(): string | Promise<string> {
    return "";
  }
}
