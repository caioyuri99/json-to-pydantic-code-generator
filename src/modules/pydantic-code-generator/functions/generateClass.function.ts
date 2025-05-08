import { PYTHON_RESERVED_KEYWORDS } from "../consts/PYTHON_RESERVED_KEYWORDS.const";
import { ClassModel } from "../types/ClassModel.type";
import { setToTypeAnnotation } from "./setToTypeAnnotation.function";

function generateClass(obj: ClassModel, indentation: number = 2): string {
  obj.attributes.map((e) => {
    if (PYTHON_RESERVED_KEYWORDS.has(e.name.toLowerCase())) {
      e.alias = e.name;
      e.name = `${e.name}_`;
    }
    return e;
  });

  const attributes = obj.attributes
    .map(
      (attr) =>
        `${" ".repeat(indentation)}${attr.name}: ${setToTypeAnnotation(attr.type)}${attr.alias ? ` = Field(..., alias='${attr.alias}')` : ""}`
    )
    .join("\n");

  return `class ${obj.className}(BaseModel):\n${attributes}`.trim();
}

export { generateClass };
