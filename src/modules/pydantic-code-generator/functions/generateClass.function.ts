import { ClassModel } from "../types/ClassModel.type";
import { setToTypeAnnotation } from "./setToTypeAnnotation.function";

function generateClass(obj: ClassModel, indentation: number = 2): string {
  const attributes = obj.attributes
    .map(
      (attr) =>
        `${" ".repeat(indentation)}${attr.name}: ${setToTypeAnnotation(attr.type)}`
    )
    .join("\n");

  return `class ${obj.className}(BaseModel):\n${attributes}`.trim();
}

export { generateClass };
