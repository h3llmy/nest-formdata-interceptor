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
 * Validator constraint to check if the value is an instance of FileData or, if the `each` option is true, an array of instances of FileData.
 */
@(ValidatorConstraint?.({ async: false }))
class IsFileDataConstraint implements ValidatorConstraintInterface {
  /**
   * Validates if the value is an instance of FileData or an array of instances of FileData when `each` option is true.
   * @param value - The value to validate.
   * @param args - The validation arguments containing constraints and other metadata.
   * @returns `true` if the value is valid, otherwise `false`.
   */
  public validate(value: FileData, args: ValidationArguments) {
    const [option] = args.constraints as [ValidationOptions];

    if (option?.each && Array.isArray(value)) {
      return value.every((item) => item instanceof FileData);
    } else {
      return value instanceof FileData;
    }
  }

  /**
   * Provides a default error message if the validation fails.
   * @param args - The validation arguments containing constraints and other metadata.
   * @returns The default error message.
   */
  public defaultMessage(args: ValidationArguments) {
    const [option] = args.constraints as [ValidationOptions];

    if (option?.each) {
      return `The value ${args.property} must be an array of instances of FileData`;
    } else {
      return `The value ${args.property} must be an instance of FileData`;
    }
  }
}

/**
 * Decorator function to validate if a property is an instance of FileData or, if the `each` option is true, an array of instances of FileData.
 * @param validationOptions - Optional validation options to customize the validation behavior.
 * @returns A property decorator function.
 */
export function IsFileData(validationOptions?: ValidationOptions) {
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
      constraints: [validationOptions],
      validator: IsFileDataConstraint,
    });
  };
}
