import type { ClassModel } from "./interfaces/ClassModel.interface";
import type { ClassAttribute } from "./interfaces/ClassAttribute.interface";
import { removeOptionalAndUnion } from "../utils/utils.module";

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
      obj.attributes.push({ name: key, type: getTipe(value) });
    }
  }

  res.push(obj);

  return res;
}

function processArray(
  value: any[],
  name: string = "Model"
): ClassModel[] | ClassAttribute {
  const firstType = getTipe(value[0]);

  if (!value.every((v) => getTipe(v) === firstType)) {
    return { name, type: "List[Any]" };
  }

  if (value[0] && typeof value[0] === "object") {
    const res: ClassModel[] = [];

    value.forEach((v) => {
      res.push(...generateClasses(v, name));
    });

    return mergeObjects(res);
  }

  return { name, type: `List[${firstType}]` };
}

function mergeObjects(objects: ClassModel[]): ClassModel[] {
  const res: ClassModel[] = [];

  for (const obj of objects) {
    const existingObj = res.find((o) => o.className === obj.className);

    if (!existingObj) {
      res.push(obj);
    } else {
      for (const attr of obj.attributes) {
        const existingAttr = existingObj.attributes.find(
          (a) => a.name === attr.name
        );

        if (!existingAttr) {
          existingObj.attributes.push(attr);
        } else {
          existingAttr.type = mergeTypes(existingAttr.type, attr.type);
        }
      }
    }
  }

  return res;
}

export function mergeTypes(oldTypes: string, typeToAdd: string): string {
  const existingTypes = new Set(removeOptionalAndUnion(oldTypes).split(", "));

  existingTypes.add(typeToAdd);

  if (oldTypes.includes("Optional")) {
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

function getTipe(value: any): string {
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getTypingImports(s: string): string {
  const types = [];

  if (s.match(/Any/g)) {
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
