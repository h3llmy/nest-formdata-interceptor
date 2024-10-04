import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import Busboy from "busboy";
import {
  IFileOptions,
  IFileSaver,
  MimeType,
} from "../interfaces/file.interface";
import { FileData } from "../classes/FileData";
import { DEFAULT_INTERCEPTOR_CONFIG } from "../config/defaultInterceptor.config";
import crypto from "crypto";

/**
 * Interceptor to handle file uploads using Busboy.
 */
@Injectable()
export class FormdataInterceptor implements NestInterceptor {
  private readonly arrayRegexPattern: RegExp = /\[\]$/;
  private readonly nestedRegexPattern: RegExp = /[[\]]/;
  private httpRequest: any;
  private busboy: Busboy.Busboy;

  /**
   * Constructs a new instance of the FormdataInterceptor class.
   * @param fileOptions - Optional configuration options for file handling.
   */
  constructor(private readonly fileOptions?: IFileOptions) {
    this.fileOptions = { ...DEFAULT_INTERCEPTOR_CONFIG, ...fileOptions };
  }

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
    const { customFileName, fileSaver } = this.fileOptions;
    const ctx = context.switchToHttp();
    this.httpRequest = ctx.getRequest<Request>();

    const request = this.httpRequest.raw ?? this.httpRequest;

    const contentType = request.headers["content-type"];

    if (contentType?.includes("multipart/form-data")) {
      return this.handleMultipartFormData(
        context,
        next,
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
    customFileName?: (
      context: ExecutionContext,
      originalFileName: string
    ) => Promise<string> | string,
    fileSaver?: IFileSaver
  ): Promise<Observable<any>> {
    return new Observable((observer) => {
      this.busboy = Busboy({ headers: this.httpRequest.headers });
      const files: Record<string, FileData> = {};
      const fields: Record<string, any> = {};

      this.busboy.on("file", async (fieldName, fileStream, fileInfo) => {
        const bufferChunks: Uint8Array[] = [];
        let fileSize: number = 0;

        fileStream.on("data", (data) => {
          bufferChunks.push(data);
          fileSize += data.length;
        });

        fileStream.on("end", async () => {
          const hash = crypto.createHash("md5");
          const fileBuffer: Buffer = Buffer.concat(bufferChunks);
          const fileExtension = fileInfo.filename.split(".").pop();
          const fileNameOnly = fileInfo.filename
            .split(".")
            .slice(0, -1)
            .join(".");
          const finalFileName = customFileName
            ? await customFileName(context, fileNameOnly)
            : fileNameOnly;
          const fullFileName = `${finalFileName}.${fileExtension}`;

          this.assignFile(fileSaver, context);

          const fileData: FileData = new FileData(
            fileInfo.filename,
            finalFileName,
            fullFileName,
            fileInfo.encoding,
            fileInfo.mimeType as MimeType,
            fileExtension,
            fileSize,
            hash.update(fileBuffer).digest("hex"),
            fileBuffer
          );

          this.handleField(files, fieldName, fileData);
        });

        fileStream.on("error", (error) => {
          observer.error(error);
          this.handleDone();
        });
      });

      this.busboy.on("field", (fieldName, val) => {
        this.handleField(fields, fieldName, val);
      });

      this.busboy.on("finish", () => {
        this.httpRequest[this.fileOptions.requestLocation] = {
          ...fields,
          ...files,
        };
        next.handle().subscribe({
          next: (val) => observer.next(val),
          error: (error) => observer.error(error),
          complete: () => {
            observer.complete();
            this.handleDone();
          },
        });
      });

      this.httpRequest?.raw
        ? this.httpRequest.raw.pipe(this.busboy)
        : this.httpRequest.pipe(this.busboy);
    });
  }

  /**
   * Cleans up the resources used by the `busboy` instance and removes all event listeners.
   */
  handleDone(): void {
    this.busboy.removeAllListeners();
    this.httpRequest.raw
      ? this.httpRequest.raw.unpipe(this.busboy)
      : this.httpRequest.unpipe(this.busboy);
  }

  /**
   * assign save file strategy
   *
   * @param fileSaver  - file saver  strategy
   * @param context - The execution context.
   */
  assignFile(fileSaver: IFileSaver, context: ExecutionContext): void {
    FileData.prototype.save = function (this: FileData, args: unknown) {
      return fileSaver.save(this, context, args);
    };
  }

  /**
   * Handles a field by setting its value in the target object, supporting nested fields and arrays.
   * @param target - The target object to set the field value.
   * @param fieldName - The name of the field.
   * @param value - The value to set.
   */
  private handleField(target: any, fieldName: string, value: any) {
    const keys = fieldName.split(this.nestedRegexPattern).filter(Boolean);
    const isArrayField = this.arrayRegexPattern.test(fieldName);
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
      const isLastKey = index === keys.length - 1;

      if (isLastKey) {
        this.assignValue(current, key, value, isArray);
      } else {
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
    });
  }

  /**
   * Assigns a value to the specified key in an object, supporting arrays.
   * @param obj - The object to set the value in.
   * @param key - The key to set the value for.
   * @param value - The value to set.
   * @param isArray - Whether the field is an array.
   */
  private assignValue(obj: any, key: string, value: any, isArray: boolean) {
    isArray
      ? this.assignArrayValue(obj, key, value)
      : this.assignSingleValue(obj, key, value);
  }

  /**
   * Assigns a single value or array value to the specified key in an object.
   * @param obj - The object to set the value in.
   * @param key - The key to set the value for.
   * @param value - The value to set.
   */
  private assignSingleValue(obj: any, key: string, value: any) {
    if (obj[key]) {
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    } else {
      obj[key] = value;
    }
  }

  /**
   * Assigns a value to an array at the specified key in an object.
   * @param obj - The object to set the value in.
   * @param key - The key to set the value for.
   * @param value - The value to set.
   */
  private assignArrayValue(obj: any, key: string, value: any) {
    if (!Array.isArray(obj[key])) {
      obj[key] = [];
    }
    obj[key].push(value);
  }
}
