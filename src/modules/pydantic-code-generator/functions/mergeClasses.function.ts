import { ClassModel } from "../types/ClassModel.type.js";
import { mergeAttributes } from "./mergeAttributes.function.js";
import { setOptional } from "./setOptional.function.js";

function mergeClasses(classes: ClassModel[]): ClassModel[] {
  const res: ClassModel[] = [];

  for (const classModel of classes) {
    setOptional(classes, classModel);

    const existingClass = res.find((e) => e.className === classModel.className);

    if (existingClass) {
      mergeAttributes(classModel, existingClass);
    } else {
      res.push(classModel);
    }
  }

  return res;
}

export { mergeClasses };
