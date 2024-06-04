import { validate, IsDefined } from "class-validator";
import { FileData, MimeType } from "../../interfaces/file.interface";
import { HasMimeType } from "../../validators/hasMimeType.decorator";

class TestSingleFileClass {
  @IsDefined()
  @HasMimeType(["image/jpeg", "image/png"])
  file: FileData;
}

class TestMultipleFilesClass {
  @IsDefined()
  @HasMimeType(["image/jpeg", "image/png"], { each: true })
  files: FileData[];
}

describe("HasMimeType", () => {
  const createFileData = (mimetype: MimeType | string): FileData => {
    return new FileData(
      "image.png",
      "image.png",
      "image.png",
      "7bit",
      mimetype as MimeType,
      "png",
      10000,
      "./image.png",
      Buffer.from("test")
    );
  };
  // const createFileData = (mimetype: MimeType | string): FileData => ({
  //   originalFileName: "testfile.jpg",
  //   fileName: "testfile",
  //   fileNameFull: `testfile.${mimetype?.split("/")[1] || "file"}`,
  //   encoding: "7bit",
  //   mimetype: mimetype as MimeType,
  //   fileExtension: mimetype?.split("/")[1] || "",
  //   fileSize: 1024,
  //   filePath: `/test/path/testfile.${mimetype?.split("/")[1] || "file"}`,
  //   buffer: Buffer.from("test content"),
  //   save: () => {
  //     console.log("file saved");
  //   },
  // });

  it("should validate single file with allowed mimetype", async () => {
    const instance = new TestSingleFileClass();
    instance.file = createFileData("image/jpeg");

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it("should fail validation for single file with disallowed mimetype", async () => {
    const instance = new TestSingleFileClass();
    instance.file = createFileData("application/pdf");

    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("HasMimeTypeConstraint");
  });

  it("should validate array of files with allowed mimetypes", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [
      createFileData("image/jpeg"),
      createFileData("image/png"),
    ];

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
    expect(errors[0].constraints).toHaveProperty("HasMimeTypeConstraint");
  });

  it("should fail validation for empty mimetype in single file", async () => {
    const instance = new TestSingleFileClass();
    instance.file = createFileData("");

    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("HasMimeTypeConstraint");
  });

  it("should fail validation for null mimetype in single file", async () => {
    const instance = new TestSingleFileClass();
    instance.file = createFileData(null as any);

    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("HasMimeTypeConstraint");
  });

  it("should validate an empty array for each option", async () => {
    const instance = new TestMultipleFilesClass();
    instance.files = [];

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });
});
