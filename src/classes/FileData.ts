import { MimeType } from "../interfaces/file.interface";

/**
 * Represents the data for a file upload.
 */
export class FileData<ReturnType = string, SavePayloadType = void> {
  constructor(
    public originalFileName: string,
    public fileName: string,
    public fileNameFull: string,
    public encoding: string,
    public mimetype: MimeType,
    public fileExtension: string,
    public fileSize: number,
    public hash: string,
    public buffer: Buffer,
  ) {}

  /**
   * Saves the file data to the specified location.
   * @param args the payload sent to the custom file saver
   * @returns the file path where the file was saved
   */
  save(args: SavePayloadType): ReturnType {
    return undefined as ReturnType;
  }
}
