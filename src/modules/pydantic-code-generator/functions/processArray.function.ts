import { ListSet } from "../classes/ListSet.class";
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
  const generatedClassModels: ClassModel[] = [];
  const types = new ListSet<string>();

  value.forEach((v) => {
    if (typeof v !== "object") {
      types.add(getType(v));

      return;
    }

    if (Array.isArray(v)) {
      const res = processArray(v, name);

      generatedClassModels.push(...res.generatedClassModels);

      types.add(res.newAttribute.type);

      return;
    }

    types.add(capitalize(name));

    generatedClassModels.push(...generateClasses(v, capitalize(name)));
  });

  return {
    generatedClassModels: mergeClasses(generatedClassModels),
    newAttribute: {
      name: name,
      type: types
    }
  };
}
