import { S3FileSaver } from "../../fileSaver/s3.file-saver";
import {
  IS3FileSaverOptions,
  MimeType,
  S3FileDataOptions,
} from "../../interfaces/file.interface";
import { ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { FileData } from "../../classes/FileData";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

// Mock AWS SDK
jest.mock("@aws-sdk/client-s3");

describe("S3FileSaver", () => {
  let fileSaver: S3FileSaver;
  let mockS3ClientSend: jest.Mock;
  const mockExecutionContext = {} as ExecutionContext;

  const mockFileData = new FileData(
    "test.jpg",
    "field",
    "test.jpg",
    "7bit",
    MimeType["image/jpeg"],
    "jpg",
    123,
    "hash",
    Buffer.from("mock content"),
  );

  const defaultOptions: IS3FileSaverOptions = {
    region: "us-east-1",
    bucket: "mock-bucket",
    endpoint: "https://custom-endpoint.com/",
  };

  beforeEach(() => {
    mockS3ClientSend = jest.fn().mockResolvedValue({});
    (S3Client as jest.Mock).mockImplementation(() => ({
      send: mockS3ClientSend,
      config: {
        endpoint: jest.fn().mockResolvedValue({ path: "/" }),
      },
    }));

    (PutObjectCommand as unknown as jest.Mock).mockImplementation(
      (params: PutObjectCommandInput) => ({
        mockCommand: true,
        input: params,
      }),
    );

    fileSaver = new S3FileSaver(defaultOptions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should upload file to S3 and return custom URL", async () => {
    const result = await fileSaver.save(mockFileData, mockExecutionContext);

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "mock-bucket",
        Key: "test.jpg",
        Body: mockFileData.buffer,
        ContentType: "image/jpeg",
      }),
    );

    expect(mockS3ClientSend).toHaveBeenCalledWith(
      expect.objectContaining({ mockCommand: true }),
    );

    expect(result).toBe("https://custom-endpoint.com//mock-bucket/test.jpg");
  });

  it("should throw an exception if bucket is missing", async () => {
    const noBucketOptions: IS3FileSaverOptions = {
      region: "us-east-1",
    };
    fileSaver = new S3FileSaver(noBucketOptions);

    await expect(
      fileSaver.save(mockFileData, mockExecutionContext),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it("should use Bucket from save() options if provided", async () => {
    const saveOptions: S3FileDataOptions = {
      Bucket: "alternate-bucket",
    };

    await fileSaver.save(mockFileData, mockExecutionContext, saveOptions);

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "alternate-bucket",
      }),
    );
  });

  it("should return default AWS S3 URL if no endpoint is provided", async () => {
    const fallbackOptions: IS3FileSaverOptions = {
      region: "us-west-2",
      bucket: "backup-bucket",
    };
    fileSaver = new S3FileSaver(fallbackOptions);

    const result = await fileSaver.save(mockFileData, mockExecutionContext);

    expect(result).toBe(
      "https://backup-bucket.s3us-west-2.amazonaws.com/test.jpg",
    );
  });
});
