import { InternalServerErrorException } from "@nestjs/common";
import { FileData } from "../classes/FileData";
import type {
  IS3FileSaverOptions,
  S3FileDataOptions,
} from "../interfaces/s3-file.interface";
import type { ExecutionContext } from "@nestjs/common";
import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import type { IFileSaver } from "../interfaces/file.interface";

let S3Client: typeof import("@aws-sdk/client-s3").S3Client;
let PutObjectCommand: typeof import("@aws-sdk/client-s3").PutObjectCommand;

try {
  // Dynamically import the S3 package
  const s3 = require("@aws-sdk/client-s3");
  S3Client = s3.S3Client;
  PutObjectCommand = s3.PutObjectCommand;
} catch (error) {
  // Gracefully handle the absence of the S3 package
  S3Client = null;
  PutObjectCommand = null;
}

export class S3FileSaver implements IFileSaver {
  private readonly s3Client: import("@aws-sdk/client-s3").S3Client;

  /**
   * Initializes a new instance of the S3FileSaver class.
   * Sets up the S3 client using the provided configuration options.
   * @param fileUploadOptions - configuration options for S3 file uploads.
   */
  constructor(private readonly fileUploadOptions: IS3FileSaverOptions) {
    if (!S3Client) {
      throw new Error(
        "AWS SDK for S3 is not installed. Please install @aws-sdk/client-s3 to use this functionality.",
      );
    }
    this.s3Client = new S3Client(fileUploadOptions);
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
    if (!S3Client || !PutObjectCommand) {
      throw new Error(
        "AWS SDK for S3 is not installed. Please install @aws-sdk/client-s3 to use this functionality.",
      );
    }

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

    const fileUrl = this.fileUploadOptions.endpoint
      ? `${this.fileUploadOptions.endpoint}/${params.Bucket}/${params.Key}`
      : `https://${params.Bucket}.s3.${this.fileUploadOptions.region}.amazonaws.com/${params.Key}`;

    return fileUrl;
  }
}
