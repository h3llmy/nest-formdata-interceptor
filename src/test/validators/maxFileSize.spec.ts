// import { validate, IsDefined } from "class-validator";
// import { FileData, MimeType } from "../../interfaces/file.interface";
// import { MaxFileSize } from "../../validators/maxFileSize.decorator";

// // Test class for a single file
// class TestSingleFileClass {
//   @IsDefined()
//   @MaxFileSize(10000)
//   file: FileData;
// }

// // Test class for multiple files
// class TestMultipleFilesClass {
//   @IsDefined()
//   @MaxFileSize(10000, { each: true })
//   files: FileData[];
// }

// describe("MaxFileSize", () => {
//   const createFileData = (fileSize: number): FileData => {
//     return new FileData(
//       "image.png",
//       "image.png",
//       "image.png",
//       "7bit",
//       "image/jpeg" as MimeType,
//       "png",
//       fileSize,
//       "./image.png",
//       Buffer.from("test")
//     );
//   };

//   it("should validate single file within max file size", async () => {
//     const instance = new TestSingleFileClass();
//     instance.file = createFileData(9000);

//     const errors = await validate(instance);
//     expect(errors.length).toBe(0);
//   });

//   it("should fail validation for single file exceeding max file size", async () => {
//     const instance = new TestSingleFileClass();
//     instance.file = createFileData(15000);

//     const errors = await validate(instance);
//     expect(errors.length).toBeGreaterThan(0);
//     expect(errors[0].constraints).toHaveProperty("MaxFileSizeConstraint");
//   });

//   it("should validate multiple files within max file size", async () => {
//     const instance = new TestMultipleFilesClass();
//     instance.files = [createFileData(5000), createFileData(4000)];

//     const errors = await validate(instance);
//     expect(errors.length).toBe(0);
//   });

//   it("should fail validation for multiple files with one exceeding max file size", async () => {
//     const instance = new TestMultipleFilesClass();
//     instance.files = [createFileData(5000), createFileData(15000)];

//     const errors = await validate(instance);
//     expect(errors.length).toBeGreaterThan(0);
//     expect(errors[0].constraints).toHaveProperty("MaxFileSizeConstraint");
//   });

//   it("should fail validation for multiple files with all exceeding max file size", async () => {
//     const instance = new TestMultipleFilesClass();
//     instance.files = [createFileData(15000), createFileData(20000)];

//     const errors = await validate(instance);
//     expect(errors.length).toBeGreaterThan(0);
//     expect(errors[0].constraints).toHaveProperty("MaxFileSizeConstraint");
//   });

//   it("should validate an empty array for each option", async () => {
//     const instance = new TestMultipleFilesClass();
//     instance.files = [];

//     const errors = await validate(instance);
//     expect(errors.length).toBe(0);
//   });
// });
