import { validate, IsDefined } from "class-validator";
import type { MimeType } from "../../interfaces/file.interface";
import { MinFileSize } from "../../validators/minFileSize.decorator";
import { FileData } from "../../classes/FileData";

// Test class for a single file
class TestSingleFileClass {
  @IsDefined()
  @MinFileSize(10000)
  file: FileData;
}

// Test class for multiple files
class TestMultipleFilesClass {
  @IsDefined()
  @MinFileSize(10000, { each: true })
  files: FileData[];
}

describe("MaxFileSize", () => {
  const createFileData = (fileSize: number): FileData => {
    return new FileData(
      "image.png",
      "image.png",
      "image.png",
      "7bit",
      "image/jpeg" as MimeType,
      "png",
      fileSize,
      "hash",
      Buffer.from("test"),
    );
  };

  it("should validate single file within max file size", async () => {
    const instance = new TestSingleFileClass();
    instance.file = createFileData(90000);

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it("should fail validation for single file exceeding max file size", async () => {
    const instance = new TestSingleFileClass();
    instance.file = createFileData(1500);

    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("MinFileSizeConstraint");
  });

  it("should validate multiple files within max file size", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [createFileData(50000), createFileData(40000)];

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it("should fail validation for multiple files with one exceeding max file size", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [createFileData(5000), createFileData(15000)];

    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("MinFileSizeConstraint");
  });

  it("should fail validation for multiple files with all exceeding max file size", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [createFileData(1500), createFileData(2000)];

    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("MinFileSizeConstraint");
  });

  it("should validate an empty array for each option", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [];

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });
});
