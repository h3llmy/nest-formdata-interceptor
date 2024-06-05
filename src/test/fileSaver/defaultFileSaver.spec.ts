import { DefaultFileSaver } from "../../fileSaver/default.file-saver";
import { FileData, MimeType } from "../../interfaces/file.interface";
import fs from "fs";
import path from "path";

// Mock the fs module
jest.mock("fs");

describe("DefaultFileSaver", () => {
  let fileSaver: DefaultFileSaver;

  beforeEach(() => {
    fileSaver = new DefaultFileSaver();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create directory if it does not exist and save file", () => {
    const mockFilePath = "/some/path/file.txt";
    const mockFileData = new FileData(
      "file.txt",
      "file",
      "file.txt",
      "7bit",
      MimeType["image/png"],
      "txt",
      100,
      mockFilePath,
      Buffer.from("test")
    );

    // Mock implementations for fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

    const result = fileSaver.save(mockFileData);

    expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(mockFilePath));
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(mockFilePath), {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      mockFileData.buffer
    );
    expect(result).toBe(mockFilePath);
  });

  it("should save file when directory already exists", () => {
    const mockFilePath = "/some/path/file.txt";
    const mockFileData = new FileData(
      "file.txt",
      "file",
      "file.txt",
      "7bit",
      MimeType["video/mp4"],
      "txt",
      100,
      mockFilePath,
      Buffer.from("test")
    );

    // Mock implementations for fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

    const result = fileSaver.save(mockFileData);

    expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(mockFilePath));
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      mockFileData.buffer
    );
    expect(result).toBe(mockFilePath);
  });
});
