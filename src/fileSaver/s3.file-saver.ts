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

  constructor(private readonly fileUploadOptions?: IS3FileSaverOptions) {
    this.s3Client = new S3Client(fileUploadOptions);
  }

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
