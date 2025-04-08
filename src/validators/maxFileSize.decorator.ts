import { FileData } from "../classes/FileData";
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";

let registerDecorator: typeof import("class-validator").registerDecorator;
let ValidatorConstraint: typeof import("class-validator").ValidatorConstraint;
let ValidatorConstraintInterface: import("class-validator").ValidatorConstraintInterface;
let ValidationArguments: import("class-validator").ValidationArguments;
let ValidationOptions: import("class-validator").ValidationOptions;

try {
  // Dynamically import class-validator
  const classValidator = require("class-validator");
  registerDecorator = classValidator.registerDecorator;
  ValidatorConstraint = classValidator.ValidatorConstraint;
  ValidatorConstraintInterface = classValidator.ValidatorConstraintInterface;
  ValidationArguments = classValidator.ValidationArguments;
  ValidationOptions = classValidator.ValidationOptions;
} catch (error) {
  // Graceful fallback if class-validator is not installed
  registerDecorator = null;
  ValidatorConstraint = null;
  ValidatorConstraintInterface = null;
  ValidationArguments = null;
  ValidationOptions = null;
}
/**
 * Validator constraint to check if the file size is within the maximum limit.
 */
@(ValidatorConstraint?.({ async: false }))
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
  validationOptions?: ValidationOptions,
) {
  if (!registerDecorator || !ValidatorConstraint) {
    throw new Error(
      "class-validator is not installed. Please install class-validator to use this functionality.",
    );
  }
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
