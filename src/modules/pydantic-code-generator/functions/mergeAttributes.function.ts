import { ClassModel } from "../types/ClassModel.type.js";
import { mergeTypes } from "./mergeTypes.function.js";

function mergeAttributes(classModel: ClassModel, existingClass: ClassModel) {
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

export { mergeAttributes };
