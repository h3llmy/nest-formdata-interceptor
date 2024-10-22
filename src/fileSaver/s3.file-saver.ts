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
   * @param fileUploadOptions - Optional configuration options for S3 file uploads.
   */
  constructor(private readonly fileUploadOptions?: IS3FileSaverOptions) {
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
    const params: PutObjectCommandInput = {
      Bucket: options.Bucket ?? this.fileUploadOptions.bucket,
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
      ? `${process.env.S3_ENDPOINT}${s3Endpoint.path}${params.Bucket}/${params.Key}`
      : `https://${params.Bucket}.s3${this.fileUploadOptions.region}.amazonaws.com/${params.Key}`;

    return fileUrl;
  }
}
