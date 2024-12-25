import { DefaultFileSaver } from "../fileSaver/default.file-saver";
import type { IFileOptions } from "../interfaces/file.interface";

export const DEFAULT_INTERCEPTOR_CONFIG: IFileOptions = {
  fileSaver: new DefaultFileSaver(),
  requestFileLocation: "body",
};
