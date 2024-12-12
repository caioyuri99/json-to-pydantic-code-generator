import type { ClassModel } from "./interfaces/ClassModel.interface";
import type { ClassAttribute } from "./interfaces/ClassAttribute.interface";
import {
  capitalize,
  removeOptionalAndUnion,
  uniqueElements
} from "../utils/utils.module";

export function generatePydanticCode(json: any): string {
  const generatedClasses = generateClasses(json);
  const classes = generatedClasses.map(generateClass).join("\n\n\n");
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
      const processedArray = processArray(value, capitalize(key));

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

function processArray(
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
      res.push(...generateClasses(v, name));
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

function setOptional(classes: ClassModel[], classModel: ClassModel) {
  const optionalAttrs = uniqueElements(
    classes
      .filter((c) => c.className === classModel.className)
      .map((e) => e.attributes.map((a) => a.name))
  );

  for (const attr of classModel.attributes) {
    if (optionalAttrs.includes(attr.name)) {
      attr.type = `Optional[${attr.type}]`;
    }
  }
}

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

export function mergeTypes(oldTypes: string, typeToAdd: string): string {
  const existingTypes = new Set(removeOptionalAndUnion(oldTypes).split(", "));

  removeOptionalAndUnion(typeToAdd)
    .split(", ")
    .forEach((e) => existingTypes.add(e));

  if (oldTypes.includes("Optional") || typeToAdd.includes("Optional")) {
    existingTypes.add("Any");
  }

  if (existingTypes.has("Any")) {
    existingTypes.delete("Any");

    if (existingTypes.size > 1) {
      return `Optional[Union[${[...existingTypes].sort().join(", ")}]]`;
    }

    if (existingTypes.size === 1) {
      return `Optional[${[...existingTypes][0]}]`;
    }

    return "Any";
  }

  if (existingTypes.size > 1) {
    return `Union[${[...existingTypes].sort().join(", ")}]`;
  }

  return [...existingTypes][0];
}

function generateClass(obj: ClassModel): string {
  const attributes = obj.attributes
    .map((attr) => `  ${attr.name}: ${attr.type}`)
    .join("\n");

  return `class ${obj.className}(BaseModel):\n${attributes}`;
}

export function getType(value: any): string {
  if (typeof value === "string") {
    return "str";
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return "int";
  }

  if (typeof value === "number") {
    return "float";
  }

  if (typeof value === "boolean") {
    return "bool";
  }

  return "Any";
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
