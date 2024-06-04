import { FileData, MimeType } from "../interfaces/file.interface";
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

/**
 * Custom validator constraint to check if the mimetype of a FileData object matches the specified types.
 */
@ValidatorConstraint({ async: false })
class HasMimeTypeConstraint implements ValidatorConstraintInterface {
  /**
   * Validates if the mimetype of the provided FileData object matches the specified types.
   * @param value The FileData object to validate.
   * @param args The validation arguments containing the constraints and options.
   * @returns A boolean indicating whether the mimetype matches the specified types.
   */
  validate(value: FileData, args: ValidationArguments) {
    const [mimeType, option] = args.constraints as [
      (MimeType | string)[],
      ValidationOptions
    ];

    if (option?.each && Array.isArray(value)) {
      return value.every((item: FileData) => mimeType.includes(item.mimetype));
    } else {
      return mimeType.includes(value?.mimetype);
    }
  }

  /**
   * Generates the default error message for the HasMimeType constraint.
   * @param args The validation arguments containing the constraints and options.
   * @returns The default error message.
   */
  defaultMessage(args: ValidationArguments) {
    const [mimeType, option] = args.constraints as [
      (MimeType | string)[],
      ValidationOptions
    ];

    if (option?.each) {
      return `The mimetype of ${args.property} must be an array of ${mimeType}`;
    } else {
      return `The mimetype of ${args.property} must be an ${mimeType}`;
    }
  }
}

/**
 * Decorator that applies the HasMimeType constraint to the specified property.
 * @param mimeType The allowed mimetype(s) to validate against.
 * @param validationOptions The validation options.
 * @returns The decorator function.
 */
export function HasMimeType(
  mimeType: (MimeType | string)[],
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [mimeType, validationOptions],
      validator: HasMimeTypeConstraint,
    });
  };
}
