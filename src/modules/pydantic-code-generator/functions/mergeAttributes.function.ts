import { ClassModel } from "../types/ClassModel.type";
import { mergeTypes } from "./mergeTypes.function";

export function mergeAttributes(
  classModel: ClassModel,
  existingClass: ClassModel
) {
  for (const attr of classModel.attributes) {
    const existingAttr = existingClass.attributes.find(
      (a) => a.name === attr.name
    );

    if (existingAttr) {
      existingAttr.type = mergeTypes(existingAttr.type, attr.type);
    } else {
      existingClass.attributes.push(attr);
    }
  }
}
