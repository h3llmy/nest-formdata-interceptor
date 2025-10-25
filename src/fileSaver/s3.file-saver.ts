import { ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { FileData } from "../classes/FileData";
import {
  IFileSaver,
  IS3FileSaverOptions,
  S3FileDataOptions,
} from "../interfaces/file.interface";
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";

export class S3FileSaver implements IFileSaver {
  private readonly s3Client: S3Client;

  /**
   * Initializes a new instance of the S3FileSaver class.
   * Sets up the S3 client using the provided configuration options.
   * @param fileUploadOptions - configuration options for S3 file uploads.
   */
  constructor(private readonly fileUploadOptions: IS3FileSaverOptions) {
    this.s3Client = new S3Client(fileUploadOptions);
  }

  /**
   * Saves multiple files to S3.
   * This method is a wrapper around the map method of the array.
   * It takes an array of FileData and maps each file to its save method.
   * The result is an array of strings, where each string is the file path
   * where the respective file was saved.
   * @param fileData - The array of file data to save.
   * @param context - The execution context, typically provided by NestJS.
   * @param args - Optional payload sent to save method.
   * @returns An array of file paths where the files were saved.
   */
  saveMany(fileData: FileData[], context: ExecutionContext, args?: unknown) {
    throw new Error("Method not implemented.");
  }

  /**
   * Saves the provided file data to an S3 bucket.
   * Constructs the S3 object parameters and sends a PutObjectCommand to S3.
   * @param fileData - The file data to be saved, including the buffer and metadata.
   * @param context - The execution context, typically provided by NestJS.
   * @param options - Optional S3-specific file data options, such as bucket and additional parameters.
   * @returns A promise that resolves to the URL of the saved file in S3.
   * @throws InternalServerErrorException if the S3 bucket is not specified.
   */
  async save(
    fileData: FileData,
    context: ExecutionContext,
    options?: S3FileDataOptions,
  ): Promise<string> {
    const params: PutObjectCommandInput = {
      Bucket: options?.Bucket ?? this.fileUploadOptions?.bucket,
      Key: fileData.fileNameFull,
      Body: fileData.buffer,
      ContentType: fileData.mimetype,
      ...options,
    };

    if (!params?.Bucket) {
      throw new InternalServerErrorException(`Bucket is required`);
    }

    const command = new PutObjectCommand(params);
    await this.s3Client.send(command);

    const s3Endpoint = await this.s3Client.config.endpoint();

    const fileUrl = this.fileUploadOptions.endpoint
      ? `${this.fileUploadOptions.endpoint}${s3Endpoint.path}${params.Bucket}/${params.Key}`
      : `https://${params.Bucket}.s3${this.fileUploadOptions.region}.amazonaws.com/${params.Key}`;

    return fileUrl;
  }
}
