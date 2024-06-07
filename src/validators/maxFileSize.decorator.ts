import { FileData } from "../classes/FileData";
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

/**
 * Validator constraint to check if the file size is within the maximum limit.
 */
@ValidatorConstraint({ async: false })
class MaxFileSizeConstraint implements ValidatorConstraintInterface {
  /**
   * Validates if the file size is within the maximum limit.
   * @param value - The FileData object to validate.
   * @param args - The validation arguments containing constraints and other metadata.
   * @returns `true` if the file size is within the limit, otherwise `false`.
   */
  public validate(value: FileData, args: ValidationArguments) {
    const [maxSize, options] = args.constraints as [number, ValidationOptions];

    if (options?.each && Array.isArray(value)) {
      return value.every((item: FileData) => item.fileSize < maxSize);
    } else {
      return value?.fileSize < maxSize;
    }
  }

  /**
   * Provides a default error message if the validation fails.
   * @param args - The validation arguments containing constraints and other metadata.
   * @returns The default error message.
   */
  public defaultMessage(args: ValidationArguments) {
    const [maxSize] = args.constraints as [number];

    return `The file ${args.property} maximum file size is ${maxSize} bytes`;
  }
}

/**
 * Decorator function to validate if the file size is within the maximum limit.
 * @param maxSize - The maximum file size in bytes.
 * @param validationOptions - Optional validation options to customize the validation behavior.
 * @returns A property decorator function.
 */
export function MaxFileSize(
  maxSize: number,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxSize, validationOptions],
      validator: MaxFileSizeConstraint,
    });
  };
}
