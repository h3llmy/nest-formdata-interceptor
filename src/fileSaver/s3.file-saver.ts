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
   * Uploads the provided file data to S3.
   * @param file - The file data to upload.
   * @param options - Optional S3-specific file data options.
   * @returns A promise that resolves to the URL of the uploaded file.
   * @throws InternalServerErrorException if the bucket is not provided.
   */
  private async uploadToS3(
    file: FileData,
    options?: S3FileDataOptions,
  ): Promise<string> {
    const bucket = options?.Bucket ?? this.fileUploadOptions.bucket;
    if (!bucket) throw new InternalServerErrorException(`Bucket is required`);

    const params: PutObjectCommandInput = {
      Bucket: bucket,
      Key: file.fileNameFull,
      Body: file.buffer,
      ContentType: file.mimetype,
      ...options,
    };

    await this.s3Client.send(new PutObjectCommand(params));

    return this.fileUploadOptions.endpoint
      ? `${this.fileUploadOptions.endpoint}/${bucket}/${params.Key}`
      : `https://${bucket}.s3.${this.fileUploadOptions.region}.amazonaws.com/${params.Key}`;
  }

  /**
   * Uploads the provided file data to S3.
   * @param fileData - The file data to upload.
   * @param context - The execution context, typically provided by NestJS.
   * @param options - Optional S3-specific file data options.
   * @returns A promise that resolves to the URL of the uploaded file.
   */
  async save(
    fileData: FileData,
    context: ExecutionContext,
    options?: S3FileDataOptions,
  ): Promise<string> {
    return this.uploadToS3(fileData, options);
  }

  /**
   * Uploads multiple files to S3.
   * This method is a wrapper around the map method of the array.
   * It takes an array of FileData and maps each file to its save method.
   * The result is an array of strings, where each string is the file path
   * where the respective file was saved.
   * @param files - The array of file data to save.
   * @param context - The execution context, typically provided by NestJS.
   * @param options - Optional S3-specific file data options.
   * @returns A promise that resolves to an array of file paths where the files were saved.
   * @throws InternalServerErrorException if any of the files failed to upload.
   */
  async saveMany(
    files: FileData[],
    context: ExecutionContext,
    options?: S3FileDataOptions,
  ): Promise<string[]> {
    if (!files?.length) return [];

    const results = await Promise.allSettled(
      files.map((file) => this.uploadToS3(file, options)),
    );

    const fileUrls: string[] = [];
    const errors: string[] = [];

    results.forEach((res, i) =>
      res.status === "fulfilled"
        ? fileUrls.push(res.value)
        : errors.push(`File ${files[i].fileNameFull} failed: ${res.reason}`),
    );

    if (errors.length)
      throw new InternalServerErrorException(errors.join("\n"));

    return fileUrls;
  }
}
