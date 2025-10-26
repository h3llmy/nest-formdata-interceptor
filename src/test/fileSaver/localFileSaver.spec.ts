import { LocalFileSaver } from "../../fileSaver/local.file-saver";
import {
  ILocalFileSaverOptions,
  MimeType,
} from "../../interfaces/file.interface";
import fs from "fs";
import path from "path";
import { ExecutionContext } from "@nestjs/common";
import { FileData } from "../../classes/FileData";

// Mock the fs module
jest.mock("fs");

describe("LocalFileSaver", () => {
  let fileSaver: LocalFileSaver;
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
    "hash",
    Buffer.from("Hello, world!"),
  );

  beforeEach(() => {
    const options: ILocalFileSaverOptions = {
      prefixDirectory: mockPrefixDirectory,
    };
    fileSaver = new LocalFileSaver(options);
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

    expect(fs.existsSync).toHaveBeenCalledWith(
      mockPrefixDirectory.replace(/^\.\//, ""),
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      mockPrefixDirectory.replace(/^\.\//, ""),
      {
        recursive: true,
      },
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath.replace(/^\.\//, ""),
      mockFileData.buffer,
    );
    expect(result).toBe(mockFilePath);
  });

  it("should save file in subdirectory when options.path is provided", () => {
    const subPath = "sub/folder";
    const fullDirectory = path.join(mockPrefixDirectory, subPath);

    const mockFilePath = path
      .join(fullDirectory, mockFileData.fileNameFull)
      .replace(/\\/g, "/");

    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

    const result = fileSaver.save(mockFileData, mockExecutionContext, {
      path: subPath,
    });

    expect(fs.existsSync).toHaveBeenCalledWith(
      fullDirectory.replace(/\\/g, "/"),
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      fullDirectory.replace(/\\/g, "/"),
      {
        recursive: true,
      },
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      mockFileData.buffer,
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

    expect(fs.existsSync).toHaveBeenCalledWith(
      mockPrefixDirectory.replace(/^\.\//, ""),
    );
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      mockFileData.buffer,
    );
    expect(result).toBe(mockFilePath);
  });

  it("should use custom directory function if provided", () => {
    const customDirectory = jest.fn().mockReturnValue("custom/dir");
    const options: ILocalFileSaverOptions = {
      prefixDirectory: mockPrefixDirectory,
      customDirectory,
    };
    fileSaver = new LocalFileSaver(options);
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
      mockPrefixDirectory,
    );
    expect(fs.existsSync).toHaveBeenCalledWith("custom/dir");
    expect(fs.mkdirSync).toHaveBeenCalledWith("custom/dir", {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      mockFileData.buffer,
    );
    expect(result).toBe(mockFilePath);
  });

  describe("saveMany", () => {
    it("should call save() on each FileData and return file paths", () => {
      const file1 = new FileData(
        "a.txt",
        "a",
        "a.txt",
        "7bit",
        MimeType["text/plain"],
        "txt",
        10,
        "hash",
        Buffer.from("A"),
      );
      const file2 = new FileData(
        "b.txt",
        "b",
        "b.txt",
        "7bit",
        MimeType["text/plain"],
        "txt",
        10,
        "hash",
        Buffer.from("B"),
      );

      const saveSpy1 = jest.spyOn(file1, "save").mockReturnValue("path/a.txt");
      const saveSpy2 = jest.spyOn(file2, "save").mockReturnValue("path/b.txt");

      const result = fileSaver.saveMany(
        [file1, file2],
        mockExecutionContext,
        {},
      );

      expect(saveSpy1).toHaveBeenCalled();
      expect(saveSpy2).toHaveBeenCalled();
      expect(result).toEqual(["path/a.txt", "path/b.txt"]);
      expect(result.length).toEqual(2);
    });

    it("should return empty array if fileData is empty", () => {
      const result = fileSaver.saveMany([], mockExecutionContext);
      expect(result).toEqual([]);
    });
  });
});
