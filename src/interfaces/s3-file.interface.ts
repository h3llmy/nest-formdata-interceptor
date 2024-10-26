import { PutObjectCommandInput, S3ClientConfig } from "@aws-sdk/client-s3";
import { FileData } from "../classes/FileData";

/**
 * Options for configuring the S3FileSaver.
 * Extends the S3ClientConfig interface from AWS SDK.
 */
export interface IS3FileSaverOptions extends S3ClientConfig {
  /**
   * The name of the S3 bucket to use for file storage.
   * If not provided, it should be specified in the save method options.
   */
  bucket?: string;
}

/**
 * Options for S3 file data operations.
 * This type excludes 'Key', 'Body', and 'ContentType' from PutObjectCommandInput,
 * as these are typically handled internally by the file saver.
 *
 * @typedef {Omit<PutObjectCommandInput, "Key" | "Body" | "ContentType">} S3FileDataOptions
 * @see {@link PutObjectCommandInput} from '@aws-sdk/client-s3'
 */
export type S3FileDataOptions = Omit<
  PutObjectCommandInput,
  "Key" | "Body" | "ContentType"
>;

/**
 * Represents the file data structure specific to S3 storage operations.
 *
 * @typedef {FileData<Promise<string>, S3FileDataOptions | void>} S3FileData
 * @extends {FileData}
 *
 * @property {Promise<string>} The promise that resolves to the URL of the saved file in S3.
 * @property {S3FileDataOptions | void} Optional S3-specific file data options.
 */
export type S3FileData = FileData<Promise<string>, S3FileDataOptions | void>;
