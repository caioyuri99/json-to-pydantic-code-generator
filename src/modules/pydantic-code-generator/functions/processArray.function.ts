import { ClassAttribute } from "../types/ClassAttribute.type";
import { ClassModel } from "../types/ClassModel.type";
import { capitalize } from "../utils/utils.module";
import { generateClasses } from "./generateClasses.function";
import { getType } from "./getType.function";
import { mergeClasses } from "./mergeClasses.function";

export function processArray(
  value: any[],
  name: string = "Model"
): { generatedClassModels: ClassModel[]; newAttribute: ClassAttribute } {
  const firstType = getType(value[0]);

  if (!value.every((v) => getType(v) === firstType)) {
    return {
      generatedClassModels: [],
      newAttribute: { name, type: "List[Any]" }
    };
  }

  if (value[0] && typeof value[0] === "object") {
    if (value.every((v) => !Array.isArray(v))) {
      const res: ClassModel[] = [];

      value.forEach((v) => {
        res.push(...generateClasses(v, capitalize(name)));
      });

      return {
        generatedClassModels: mergeClasses(res),
        newAttribute: { name, type: `List[${capitalize(name)}]` }
      };
    }

    if (value.every((v) => Array.isArray(v))) {
      const res: {
        generatedClassModels: ClassModel[];
        newAttribute: ClassAttribute;
      }[] = [];

      value.forEach((v) => {
        res.push(processArray(v, name));
      });

      if (res.every((e) => e.newAttribute.type === res[0].newAttribute.type)) {
        return {
          generatedClassModels: mergeClasses(
            res.flatMap((e) => e.generatedClassModels)
          ),
          newAttribute: {
            name,
            type: `List[${res[0].newAttribute.type}]`
          }
        };
      }

      return {
        generatedClassModels: [],
        newAttribute: { name, type: "List[List[Any]]" }
      };
    }

    return {
      generatedClassModels: [],
      newAttribute: { name, type: `List[Any]` }
    };
  }

  return {
    generatedClassModels: [],
    newAttribute: { name, type: `List[${firstType}]` }
  };
}
