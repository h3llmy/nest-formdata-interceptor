import { LocalFileSaver } from "../fileSaver/local.file-saver";
import { IFileOptions } from "../interfaces/file.interface";

export const DEFAULT_INTERCEPTOR_CONFIG: IFileOptions = {
  fileSaver: new LocalFileSaver(),
  requestFileLocation: "body",
};
