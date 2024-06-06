import { DefaultFileSaver } from "../../fileSaver/default.file-saver";
import {
  DefaultFileSaverOptions,
  FileData,
  MimeType,
} from "../../interfaces/file.interface";
import fs from "fs";
import path from "path";
import { ExecutionContext } from "@nestjs/common";

// Mock the fs module
jest.mock("fs");

describe("DefaultFileSaver", () => {
  let fileSaver: DefaultFileSaver;
  const mockPrefixDirectory = "./public";
  const mockExecutionContext = {} as ExecutionContext;

  const mockFileData = new FileData(
    "file.txt",
    "file",
    "file.txt",
    "7bit",
    MimeType["image/png"],
    "txt",
    100,
    Buffer.from("Hello, world!")
  );

  beforeEach(() => {
    const options: DefaultFileSaverOptions = {
      prefixDirectory: mockPrefixDirectory,
    };
    fileSaver = new DefaultFileSaver(options);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create directory if it does not exist and save file", () => {
    const mockFilePath = path
      .join(mockPrefixDirectory, mockFileData.fileNameFull)
      .replace(/\\/g, "/");

    // Mock implementations for fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

    const result = fileSaver.save(mockFileData, mockExecutionContext);

    expect(fs.existsSync).toHaveBeenCalledWith(mockPrefixDirectory);
    expect(fs.mkdirSync).toHaveBeenCalledWith(mockPrefixDirectory, {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      mockFileData.buffer
    );
    expect(result).toBe(mockFilePath);
  });

  it("should save file when directory already exists", () => {
    const mockFilePath = path
      .join(mockPrefixDirectory, mockFileData.fileNameFull)
      .replace(/\\/g, "/");

    // Mock implementations for fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

    const result = fileSaver.save(mockFileData, mockExecutionContext);

    expect(fs.existsSync).toHaveBeenCalledWith(mockPrefixDirectory);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      mockFileData.buffer
    );
    expect(result).toBe(mockFilePath);
  });

  it("should use custom directory function if provided", () => {
    const customDirectory = jest.fn().mockReturnValue("custom/dir");
    const options: DefaultFileSaverOptions = {
      prefixDirectory: mockPrefixDirectory,
      customDirectory,
    };
    fileSaver = new DefaultFileSaver(options);
    const mockFilePath = path
      .join("custom/dir", mockFileData.fileNameFull)
      .replace(/\\/g, "/");

    // Mock implementations for fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

    const result = fileSaver.save(mockFileData, mockExecutionContext);

    expect(customDirectory).toHaveBeenCalledWith(
      mockExecutionContext,
      mockPrefixDirectory
    );
    expect(fs.existsSync).toHaveBeenCalledWith("custom/dir");
    expect(fs.mkdirSync).toHaveBeenCalledWith("custom/dir", {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      mockFileData.buffer
    );
    expect(result).toBe(mockFilePath);
  });
});
