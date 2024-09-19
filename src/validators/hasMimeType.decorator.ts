import { FileData } from "../classes/FileData";
import { MimeType } from "../interfaces/file.interface";
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
  public validate(value: FileData, args: ValidationArguments) {
    const [mimeType] = args.constraints as [(MimeType | string)[]];

    if (Array.isArray(value)) {
      return value.every((item: FileData) =>
        this.matchesWildcard(mimeType, item.mimetype)
      );
    }
    return this.matchesWildcard(mimeType, value?.mimetype);
  }

  /**
   * Checks if a mimetype matches a wildcard type.
   * @param mimeType An array of allowed mimetypes (or a single mimetype).
   * @param type The mimetype to check against the allowed types.
   * @returns A boolean indicating whether the mimetype matches any of the allowed types.
   */
  private matchesWildcard(mimeType: (MimeType | string)[], type: string) {
    return mimeType.some((allowedType) => {
      if (allowedType.endsWith("/*")) {
        return type.startsWith(allowedType.slice(0, -2));
      }
      return type === allowedType;
    });
  }

  /**
   * Generates the default error message for the HasMimeType constraint.
   * @param args The validation arguments containing the constraints and options.
   * @returns The default error message.
   */
  public defaultMessage(args: ValidationArguments) {
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
