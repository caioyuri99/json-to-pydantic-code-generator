import { ClassModel } from "../types/ClassModel.type";
import { setToTypeAnnotation } from "./setToTypeAnnotation.function";

export function generateClass(
  obj: ClassModel,
  indentation: number = 2
): string {
  const attributes = obj.attributes
    .map(
      (attr) =>
        `${" ".repeat(indentation)}${attr.name}: ${typeof attr.type === "string" ? attr.type : setToTypeAnnotation(attr.type)}`
    )
    .join("\n");

  return `class ${obj.className}(BaseModel):\n${attributes}`.trim();
}
