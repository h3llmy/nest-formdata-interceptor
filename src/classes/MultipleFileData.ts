import { FileData } from "./FileData";

export class MultipleFileData<
  ReturnType = string[],
  SavePayloadType = void,
> extends Array<FileData> {
  constructor(...files: FileData[]) {
    super(...files);
    Object.setPrototypeOf(this, MultipleFileData.prototype);
  }

  static get [Symbol.species](): ArrayConstructor {
    return this as unknown as ArrayConstructor;
  }

  /**
   * Maps the FileData elements of the MultipleFileData array to a new array.
   * If the mapped values are all instances of FileData, the resulting array is wrapped in a new MultipleFileData instance.
   * Otherwise, the resulting array is returned as-is.
   * @param callbackfn - The function to execute on each element.
   * @param thisArg - The value of `this` provided to the callback function.
   * @returns The resulting array of values.
   */
  override map<U extends FileData>(
    callbackfn: (value: FileData, index: number, array: FileData[]) => U,
    thisArg?: any,
  ): MultipleFileData<ReturnType, SavePayloadType>;

  /**
   * Maps the FileData elements of the MultipleFileData array to a new array.
   * If the mapped values are all instances of FileData, the resulting array is wrapped in a new MultipleFileData instance.
   * Otherwise, the resulting array is returned as-is.
   * @param callbackfn - The function to execute on each element.
   * @param thisArg - The value of `this` provided to the callback function.
   * @returns The resulting array of values.
   */
  override map<U>(
    callbackfn: (value: FileData, index: number, array: FileData[]) => U,
    thisArg?: any,
  ): U[];

  /**
   * Maps the FileData elements of the MultipleFileData array to a new array.
   * If the mapped values are all instances of FileData, the resulting array is wrapped in a new MultipleFileData instance.
   * Otherwise, the resulting array is returned as-is.
   * @param callbackfn - The function to execute on each element.
   * @param thisArg - The value of `this` provided to the callback function.
   * @returns The resulting array of values.
   */
  override map<U>(
    callbackfn: (value: FileData, index: number, array: FileData[]) => U,
    thisArg?: any,
  ): any {
    const result = super.map(callbackfn, thisArg);

    if (result.length > 0 && result.every((r) => r instanceof FileData)) {
      return new MultipleFileData<ReturnType, SavePayloadType>(
        ...(result as unknown as FileData[]),
      );
    }

    return result;
  }

  /**
   * Creates a shallow copy of a portion of an array into a new MultipleFileData object.
   * The elements of the returned array are chosen from the original array.
   * @param predicate - A function to test each element of the array.
   * @param thisArg - Value to use as this when executing callback.
   * @returns A new MultipleFileData object containing the filtered elements.
   */
  override filter(
    predicate: (value: FileData, index: number, array: FileData[]) => boolean,
    thisArg?: any,
  ): MultipleFileData<ReturnType, SavePayloadType> {
    const result = super.filter(predicate, thisArg);
    return new MultipleFileData<ReturnType, SavePayloadType>(...result);
  }

  /**
   * Creates a shallow copy of a portion of an array into a new MultipleFileData object.
   * @param start - The starting index of the slice. If negative, it is treated as being relative to the end of the array.
   * @param end - The ending index of the slice. If negative, it is treated as being relative to the end of the array.
   * @returns A new MultipleFileData object containing the sliced elements.
   */
  override slice(
    start?: number,
    end?: number,
  ): MultipleFileData<ReturnType, SavePayloadType> {
    const result = super.slice(start, end);
    return new MultipleFileData<ReturnType, SavePayloadType>(...result);
  }

  /**
   * Calls a provided function once for each FileData element in the array.
   * The provided function is invoked with the following arguments:
   *   value: The current FileData element being processed in the array.
   *   index: The index of the current FileData element being processed in the array.
   *   array: The array of FileData elements.
   * @param callbackfn - The function to call for each FileData element.
   * @param thisArg - Optional value to use as `this` when executing callback.
   */
  override forEach(
    callbackfn: (value: FileData, index: number, array: FileData[]) => void,
    thisArg?: any,
  ): void {
    return super.forEach(callbackfn, thisArg);
  }

  /**
   * Saves multiple files to the specified location.
   * This method is a wrapper around the map method of the array.
   * It takes an array of FileData and maps each file to its save method.
   * The result is an array of strings, where each string is the file path
   * where the respective file was saved.
   * @param args - Optional payload sent to the save method.
   * @returns An array of file paths where the files were saved.
   */
  public bulkSave(args: SavePayloadType): ReturnType {
    return undefined as ReturnType;
  }
}
