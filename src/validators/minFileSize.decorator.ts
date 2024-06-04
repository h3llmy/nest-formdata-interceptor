import { FileData } from "../interfaces/file.interface";
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

/**
 * Validator constraint to check if the file size is above the minimum limit.
 */
@ValidatorConstraint({ async: false })
class MinFileSizeConstraint implements ValidatorConstraintInterface {
  /**
   * Validates if the file size is above the minimum limit.
   * @param value - The FileData object to validate.
   * @param args - The validation arguments containing constraints and other metadata.
   * @returns `true` if the file size is above the limit, otherwise `false`.
   */
  validate(value: FileData, args: ValidationArguments) {
    const [minSize, options] = args.constraints as [number, ValidationOptions];

    if (options?.each && Array.isArray(value)) {
      return value.every((item: FileData) => item.fileSize > minSize);
    } else {
      return value?.fileSize > minSize;
    }
  }

  /**
   * Provides a default error message if the validation fails.
   * @param args - The validation arguments containing constraints and other metadata.
   * @returns The default error message.
   */
  defaultMessage(args: ValidationArguments) {
    const [minSize] = args.constraints as [number];

    return `The file ${args.property} minimum file size is ${minSize} bytes`;
  }
}

/**
 * Decorator function to validate if the file size is above the minimum limit.
 * @param minSize - The minimum file size in bytes.
 * @param validationOptions - Optional validation options to customize the validation behavior.
 * @returns A property decorator function.
 */
export function MinFileSize(
  minSize: number,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minSize, validationOptions],
      validator: MinFileSizeConstraint,
    });
  };
}
