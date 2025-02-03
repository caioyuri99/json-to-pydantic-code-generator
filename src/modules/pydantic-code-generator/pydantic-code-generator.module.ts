import type { ClassModel } from "./interfaces/ClassModel.interface";
import type { ClassAttribute } from "./interfaces/ClassAttribute.interface";
import { capitalize, uniqueElements } from "../utils/utils.module";

export function generatePydanticCode(json: any): string {
  const generatedClasses = generateClasses(json);
  const classes = generatedClasses.map((e) => generateClass(e)).join("\n\n\n");
  const importLines = ["from pydantic import BaseModel"];

  const typingImports = getTypingImports(classes);

  if (typingImports) {
    importLines.push(typingImports);
  }

  return `${importLines.join("\n\n")}\n\n\n${classes}`;
}

function generateClasses(json: any, name: string = "Model"): ClassModel[] {
  const res: ClassModel[] = [];
  const obj: ClassModel = { className: name, attributes: [] };

  for (const [key, value] of Object.entries(json)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const generatedClasses = generateClasses(value, capitalize(key));

      for (const [index, generatedClass] of generatedClasses.entries()) {
        const existingClassWithSameAttrs = res.find(
          (c) =>
            c.attributes.length === generatedClass.attributes.length &&
            c.attributes.every((attr) =>
              generatedClass.attributes.find(
                (a) => a.name === attr.name && a.type === attr.type
              )
            )
        );

        if (existingClassWithSameAttrs) {
          for (let i = index + 1; i < generatedClasses.length; i++) {
            for (const attr of generatedClasses[i].attributes) {
              if (attr.type === generatedClass.className) {
                attr.type = existingClassWithSameAttrs.className;
              }
            }
          }

          generatedClass.className = existingClassWithSameAttrs.className;
        } else {
          const existingClass = res.find(
            (c) => c.className === generatedClass.className
          );

          if (!existingClass) {
            res.push(generatedClass);
          } else {
            let i = 1;
            let newClassName = `${generatedClass.className}${i}`;

            while (res.find((c) => c.className === newClassName)) {
              i++;
              newClassName = `${generatedClass.className}${i}`;
            }

            for (let i = index + 1; i < generatedClasses.length; i++) {
              for (const attr of generatedClasses[i].attributes) {
                if (attr.type === generatedClass.className) {
                  attr.type = newClassName;
                }
              }
            }

            generatedClass.className = newClassName;

            res.push(generatedClass);
          }
        }
      }

      const lastGeneratedClass = generatedClasses.at(-1);

      if (lastGeneratedClass) {
        obj.attributes.push({
          name: key,
          type: lastGeneratedClass.className
        });
      }
    } else if (Array.isArray(value)) {
      const processedArray = processArray(value, key);

      if (Array.isArray(processedArray)) {
        for (const [index, generatedClass] of processedArray.entries()) {
          const existingClassWithSameAttrs = res.find(
            (c) =>
              c.attributes.length === generatedClass.attributes.length &&
              c.attributes.every((attr) =>
                generatedClass.attributes.find(
                  (a) => a.name === attr.name && a.type === attr.type
                )
              )
          );

          if (existingClassWithSameAttrs) {
            for (let i = index + 1; i < processedArray.length; i++) {
              for (const attr of processedArray[i].attributes) {
                if (attr.type === generatedClass.className) {
                  attr.type = existingClassWithSameAttrs.className;
                }
              }
            }

            generatedClass.className = existingClassWithSameAttrs.className;
          } else {
            const existingClass = res.find(
              (c) => c.className === generatedClass.className
            );

            if (!existingClass) {
              res.push(generatedClass);
            } else {
              let i = 1;
              let newClassName = `${generatedClass.className}${i}`;

              while (res.find((c) => c.className === newClassName)) {
                i++;
                newClassName = `${generatedClass.className}${i}`;
              }

              for (let i = index + 1; i < processedArray.length; i++) {
                for (const attr of processedArray[i].attributes) {
                  if (attr.type === `List[${generatedClass.className}]`) {
                    attr.type = `List[${newClassName}]`;
                  }
                }
              }

              generatedClass.className = newClassName;

              res.push(generatedClass);
            }
          }
        }

        const lastGeneratedClass = processedArray.at(-1);

        if (lastGeneratedClass) {
          obj.attributes.push({
            name: key,
            type: `List[${lastGeneratedClass.className}]`
          });
        }
      } else {
        obj.attributes.push(processedArray);
      }
    } else {
      obj.attributes.push({ name: key, type: getType(value) });
    }
  }

  res.push(obj);

  return res;
}

export function processArray(
  value: any[],
  name: string = "Model"
): ClassModel[] | ClassAttribute {
  const firstType = getType(value[0]);

  if (!value.every((v) => getType(v) === firstType)) {
    return { name, type: "List[Any]" };
  }

  if (value[0] && typeof value[0] === "object") {
    const res: ClassModel[] = [];

    value.forEach((v) => {
      res.push(...generateClasses(v, capitalize(name)));
    });

    return mergeClasses(res);
  }

  return { name, type: `List[${firstType}]` };
}

export function mergeClasses(classes: ClassModel[]): ClassModel[] {
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

export function setOptional(classes: ClassModel[], classModel: ClassModel) {
  const optionalAttrs = uniqueElements(
    classes
      .filter((c) => c.className === classModel.className)
      .map((e) => e.attributes.map((a) => a.name))
  );

  for (const attr of classModel.attributes) {
    if (optionalAttrs.includes(attr.name)) {
      if (typeof attr.type === "string") {
        attr.type = new Set(["Any", attr.type]);
      } else {
        attr.type.add("Any");
      }
    }
  }
}

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

export function mergeTypes(
  oldTypes: string | Set<string>,
  typeToAdd: string | Set<string>
): string | Set<string> {
  if (typeof oldTypes === "string") {
    if (typeof typeToAdd === "string") {
      if (oldTypes === typeToAdd) {
        return oldTypes;
      }

      return new Set([oldTypes, typeToAdd]);
    }

    return typeToAdd.add(oldTypes);
  }

  if (typeof typeToAdd === "string") {
    return oldTypes.add(typeToAdd);
  }

  return new Set([...oldTypes, ...typeToAdd]);
}

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

export function getType(value: any): string {
  switch (typeof value) {
    case "string":
      return "str";

    case "number":
      if (Number.isInteger(value)) {
        return "int";
      }

      return "float";

    case "boolean":
      return "bool";

    default:
      return "Any";
  }
}

export function getTypingImports(s: string): string {
  const types = [];

  if (s.match(/(?<=^|\s)Any(?=\s|$|\])|\[Any\]/g)) {
    types.push("Any");
  }

  if (s.match(/List\[[^\]]+\]/g)) {
    types.push("List");
  }

  if (s.match(/Optional\[[^\]]+\]/g)) {
    types.push("Optional");
  }

  if (s.match(/Union\[[^\]]+\]/g)) {
    types.push("Union");
  }

  if (types.length === 0) {
    return "";
  }

  return `from typing import ${types.join(", ")}`;
}

export function setToTypeAnnotation(s: Set<string>): string {
  if (s.size > 1) {
    if (s.delete("Any")) {
      return `Optional[${setToTypeAnnotation(s)}]`;
    }

    return `Union[${[...s].sort().join(", ")}]`;
  }

  return [...s][0];
}
