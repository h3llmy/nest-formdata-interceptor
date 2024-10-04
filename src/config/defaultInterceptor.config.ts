import { DefaultFileSaver } from "../fileSaver/default.file-saver";
import { IFileOptions } from "../interfaces/file.interface";

export const DEFAULT_INTERCEPTOR_CONFIG: IFileOptions = {
  fileSaver: new DefaultFileSaver(),
  requestLocation: "body",
};
