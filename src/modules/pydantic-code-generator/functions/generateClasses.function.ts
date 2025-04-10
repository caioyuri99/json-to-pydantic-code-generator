import { ClassModel } from "../types/ClassModel.type";
import { getType } from "./getType.function";
import { processArray } from "./processArray.function";
import { ClassAttribute } from "../types/ClassAttribute.type";
import { capitalize, unwrapList, wrapList } from "../utils/utils.module";

export function generateClasses(
  json: any,
  name: string = "Model"
): ClassModel[] {
  const res: ClassModel[] = [];
  const obj: ClassModel = { className: name, attributes: [] };

  if (typeof json === "object" && Array.isArray(json)) {
    if (
      json.some((e) => typeof e !== "object" || Array.isArray(e)) ||
      json.length === 0
    ) {
      throw new Error("Input must be an object or an array of objects");
    }

    return processArray(json).generatedClassModels;
  }

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
      const generatedClassModels = processedArray.generatedClassModels;
      const newAttribute = processedArray.newAttribute;

      if (processedArray.generatedClassModels.length > 0) {
        for (const [index, generatedClass] of generatedClassModels.entries()) {
          const existingClassWithSameAttrs = res.find(
            (c) =>
              c.attributes.length === generatedClass.attributes.length &&
              c.attributes.every((attr) =>
                generatedClass.attributes.find(
                  (a: ClassAttribute) =>
                    a.name === attr.name && a.type === attr.type
                )
              )
          );

          if (existingClassWithSameAttrs) {
            for (let i = index + 1; i < generatedClassModels.length; i++) {
              for (const attr of generatedClassModels[i].attributes) {
                if (attr.type === generatedClass.className) {
                  attr.type = existingClassWithSameAttrs.className;
                }
              }
            }

            const { innerType, listCount } = unwrapList(
              newAttribute.type as string
            );

            if (innerType === generatedClass.className) {
              newAttribute.type = wrapList(
                existingClassWithSameAttrs.className,
                listCount
              );
            }

            generatedClass.className = existingClassWithSameAttrs.className;
          } else {
            //TODO: verificar se esse bloco está funcionando corretamente

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

              const generatedType = `List[${generatedClass.className}]`;
              const existingType = `List[${newClassName}]`;

              for (let i = index + 1; i < generatedClassModels.length; i++) {
                for (const attr of generatedClassModels[i].attributes) {
                  if (attr.type === generatedType) {
                    attr.type = existingType;
                  }
                }
              }

              if (newAttribute.type === generatedType) {
                newAttribute.type = existingType;
              }
              generatedClass.className = newClassName;

              res.push(generatedClass);
            }
          }
        }
      }

      obj.attributes.push(newAttribute);
    } else {
      obj.attributes.push({ name: key, type: getType(value) });
    }
  }

  res.push(obj);

  return res;
}
