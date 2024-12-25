import { validate, IsDefined } from "class-validator";
import { MimeType } from "../../interfaces/file.interface";
import { IsFileData } from "../../validators/isFileData.decorator";
import { FileData } from "../../classes/FileData";

class TestSingleFileClass {
  @IsDefined()
  @IsFileData()
  file: FileData;
}

class TestMultipleFilesClass {
  @IsDefined()
  @IsFileData({ each: true })
  files: FileData[];
}

describe("IsFileData", () => {
  const createFileDataConstant = (): FileData => {
    return new FileData(
      "image.png",
      "image.png",
      "image.png",
      "7bit",
      MimeType["image/png"],
      "png",
      10000,
      "hash",
      Buffer.from("test"),
    );
  };

  const createFileData = (mimetype: MimeType | string): any => ({
    originalFileName: "testFile.jpg",
    fileName: "testFile",
    fileNameFull: `testFile.${mimetype?.split("/")[1] || "file"}`,
    encoding: "7bit",
    mimetype: mimetype as MimeType,
    fileExtension: mimetype?.split("/")[1] || "",
    fileSize: 1024,
    buffer: Buffer.from("test content"),
    save: () => {
      return "file saved";
    },
  });

  it("should validate single file with allowed mimetype", async () => {
    const instance = new TestSingleFileClass();
    instance.file = createFileDataConstant();

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it("should fail validation for single file with disallowed mimetype", async () => {
    const instance = new TestSingleFileClass();
    instance.file = createFileData("application/pdf");

    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("IsFileDataConstraint");
  });

  it("should validate array of files with allowed mime types", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [createFileDataConstant(), createFileDataConstant()];

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it("should fail validation for array of files with one disallowed mimetype", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [
      createFileData("image/jpeg"),
      createFileData("application/pdf"),
    ];

    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("IsFileDataConstraint");
  });

  it("should validate an empty array for each option", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [];

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });
});
