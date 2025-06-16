import { ListSet } from "../classes/ListSet.class";
import { PYTHON_RESERVED_KEYWORDS } from "../consts/PYTHON_RESERVED_KEYWORDS.const";
import { ClassModel } from "../types/ClassModel.type";
import { setToTypeAnnotation } from "./setToTypeAnnotation.function";

function generateClass(
  obj: ClassModel,
  indentation: number = 4,
  aliasCamelCase = false
): string {
  // handle python reserved keywords
  obj.attributes.map((e) => {
    if (PYTHON_RESERVED_KEYWORDS.has(e.name)) {
      e.alias = e.name;
      e.name = `${e.name}_`;
    }
  });

  // handle words that starts with numbers
  obj.attributes.map((e) => {
    if (e.name.match(/^[0-9]/)) {
      if (!e.alias) {
        e.alias = e.name;
      }

      e.name = `field_${e.name}`;
    }
  });

  // apply aliasCamelCase flag
  if (aliasCamelCase) {
    obj.attributes.map((e) => {
      const newName = e.name
        .split(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/)
        .map((s) => s.toLowerCase())
        .join("_");

      if (!e.alias && e.name !== newName) {
        e.alias = e.name;
      }

      e.name = newName;
    });
  }

  obj.attributes.map((e) => {
    // normalize words
    if (e.name.match(/[^a-zA-Z0-9_]+/)) {
      if (!e.alias) {
        e.alias = e.name;
      }
      e.name = e.name.replaceAll(/[^a-zA-Z0-9_]/g, "_");
    }

    // handle duplicate names after normalization
    let originalName = e.name;
    let c = 1;
    while (obj.attributes.filter((el) => el.name === e.name).length > 1) {
      e.name = `${originalName}_${c}`;
      c++;
    }

    return e;
  });

  const attributes =
    obj.attributes.length > 0
      ? obj.attributes
          .map((attr) => {
            let posfix = "";

            if (attr.alias) {
              posfix = ` = Field(${attr.type.has("Any") ? "None" : "..."}, alias='${attr.alias}')`;
            } else if (
              attr.type.has("Any") &&
              !(attr.type instanceof ListSet) &&
              attr.type.size > 1
            ) {
              posfix = " = None";
            }

            return `${" ".repeat(indentation)}${attr.name}: ${setToTypeAnnotation(attr.type)}${posfix}`;
          })
          .join("\n")
      : `${" ".repeat(indentation)}pass`;

  return `class ${obj.className}(BaseModel):\n${attributes}`.trim();
}

export { generateClass };
