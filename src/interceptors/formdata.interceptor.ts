import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import Busboy from "busboy";
import { DefaultFileSaver } from "../fileSaver/default.file-saver";
import {
  IFileOptions,
  IFileSaver,
  MimeType,
} from "../interfaces/file.interface";
import { FileData } from "../classes/FileData";

/**
 * Interceptor to handle file uploads using Busboy.
 */
@Injectable()
export class FormdataInterceptor implements NestInterceptor {
  private readonly arrayRegexPattern: RegExp = /\[\]$/;
  private readonly nestedRegexPattern: RegExp = /[\[\]]/;
  private httpRequest: any;

  /**
   * Constructs a new instance of the FormdataInterceptor class.
   * @param fileOptions - Optional configuration options for file handling.
   */
  constructor(private readonly fileOptions?: IFileOptions) {}

  /**
   * Intercepts the request to handle file uploads if the content type is multipart/form-data.
   * @param context - The execution context.
   * @param next - The next call handler.
   * @returns An Observable that processes the file upload.
   */
  public async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const { customFileName, fileSaver = new DefaultFileSaver() } =
      this.fileOptions || {};
    const ctx = context.switchToHttp();
    this.httpRequest = ctx.getRequest<Request>();

    const isFastify = !!this.httpRequest.raw;
    const request = isFastify ? this.httpRequest.raw : this.httpRequest;

    const contentType = request.headers["content-type"];

    if (contentType && contentType.includes("multipart/form-data")) {
      return this.handleMultipartFormData(
        context,
        next,
        request,
        customFileName,
        fileSaver
      );
    }

    return next.handle();
  }

  /**
   * Handles multipart/form-data file uploads.
   * @param context - The execution context.
   * @param next - The next call handler.
   * @param request - The HTTP request.
   * @param customFileName - Optional function to customize file names.
   * @param fileSaver - Optional file saver implementation.
   * @returns An Observable that processes the file upload.
   */
  private async handleMultipartFormData(
    context: ExecutionContext,
    next: CallHandler,
    request: any,
    customFileName?: (
      context: ExecutionContext,
      originalFileName: string
    ) => Promise<string> | string,
    fileSaver?: IFileSaver
  ): Promise<Observable<any>> {
    return new Observable((observer) => {
      const busboy = Busboy({ headers: request.headers });
      const files = {};
      const fields = {};

      busboy.on("file", async (fieldname, file, fileInfo) => {
        const fileBuffer = [];
        let fileSize = 0;

        file.on("data", (data) => {
          fileBuffer.push(data);
          fileSize += data.length;
        });

        file.on("end", async () => {
          const fileExtension = fileInfo.filename.split(".").pop();
          const fileNameOnly = fileInfo.filename
            .split(".")
            .slice(0, -1)
            .join(".");
          const finalFileName = customFileName
            ? await customFileName(context, fileNameOnly)
            : fileNameOnly;
          const fullFileName = `${finalFileName}.${fileExtension}`;

          FileData.prototype.save = function (this: FileData) {
            return fileSaver.save(this, context);
          };

          const fileData = new FileData(
            fileInfo.filename,
            finalFileName,
            fullFileName,
            fileInfo.encoding,
            fileInfo.mimeType as MimeType,
            fileExtension,
            fileSize,
            Buffer.concat(fileBuffer)
          );

          this.handleField(files, fieldname, fileData);
        });
      });

      busboy.on("field", (fieldname, val) => {
        this.handleField(fields, fieldname, val);
      });

      busboy.on("finish", () => {
        this.httpRequest["body"] = { ...fields, ...files };
        next.handle().subscribe({
          next: (val) => observer.next(val),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });

      request.pipe(busboy);
    });
  }

  /**
   * Handles a field by setting its value in the target object, supporting nested fields and arrays.
   * @param target - The target object to set the field value.
   * @param fieldname - The name of the field.
   * @param value - The value to set.
   */
  private handleField(target: any, fieldname: string, value: any) {
    const keys = fieldname.split(this.nestedRegexPattern).filter(Boolean);
    const isArrayField = this.arrayRegexPattern.test(fieldname);
    this.setNestedValue(target, keys, value, isArrayField);
  }

  /**
   * Sets a nested value in an object, supporting nested fields and arrays.
   * @param obj - The object to set the nested value in.
   * @param keys - The keys representing the nested path.
   * @param value - The value to set.
   * @param isArray - Whether the field is an array.
   */
  private setNestedValue(
    obj: any,
    keys: string[],
    value: any,
    isArray = false
  ) {
    let current = obj;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        if (isArray) {
          if (!Array.isArray(current[key])) {
            current[key] = [];
          }
          current[key].push(value);
        } else {
          if (current[key]) {
            if (Array.isArray(current[key])) {
              current[key].push(value);
            } else {
              current[key] = [current[key], value];
            }
          } else {
            current[key] = value;
          }
        }
      } else {
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
    });
  }
}
