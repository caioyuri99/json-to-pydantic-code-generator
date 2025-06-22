import { ListSet } from "../classes/ListSet.class.js";
import { ClassAttribute } from "../types/ClassAttribute.type.js";
import { ClassModel } from "../types/ClassModel.type.js";
import {
  addType,
  getArrayClassName,
  getClassName,
  getNonDuplicateName,
  hasType,
  replaceType
} from "../utils/utils.module.js";
import { generateClasses } from "./generateClasses.function.js";
import { getType } from "./getType.function.js";
import { mergeClasses } from "./mergeClasses.function.js";

function processArray(
  value: any[],
  name: string = "Model",
  existentClassNames: string[] = [],
  fromObjectArrayJson = false,
  preferClassReuse = false
): { generatedClassModels: ClassModel[]; newAttribute: ClassAttribute } {
  const generatedClassModels: ClassModel[] = [];
  const types = new ListSet<string>();

  value.forEach((v) => {
    if (typeof v !== "object") {
      addType(types, getType(v));

      return;
    }

    if (Array.isArray(v)) {
      const res = processArray(v, name, existentClassNames, preferClassReuse);

      generatedClassModels.push(...res.generatedClassModels);

      addType(types, res.newAttribute.type);

      return;
    }

    if (v === null) {
      addType(types, "Any");

      return;
    }

    const className = getClassName(name);

    const newName = fromObjectArrayJson
      ? className
      : getArrayClassName(className);

    generatedClassModels.push(
      ...generateClasses(
        v,
        getNonDuplicateName(newName, existentClassNames),
        existentClassNames,
        preferClassReuse
      )
    );

    // considerando que v é um objeto, generateClasses vai gerar pelo menos 1 ClassModel, logo generatedClassModels.at(-1) nunca será undefined
    addType(types, generatedClassModels.at(-1)!.className);
  });

  const orderedClassModels = mergeClasses(generatedClassModels).sort((a, b) => {
    const aDependsOnB = a.attributes.some((attr) =>
      hasType(attr.type, b.className)
    );
    const bDependsOnA = b.attributes.some((attr) =>
      hasType(attr.type, a.className)
    );

    if (aDependsOnB && !bDependsOnA) {
      return 1;
    }

    if (bDependsOnA && !aDependsOnB) {
      return -1;
    }

    return 0;
  });

  if (
    orderedClassModels.length === 1 &&
    orderedClassModels[0].attributes.length === 0
  ) {
    replaceType(types, orderedClassModels[0].className, "Dict[str, Any]");

    return {
      generatedClassModels: [],
      newAttribute: {
        name: name,
        type: types
      }
    };
  }

  return {
    generatedClassModels: orderedClassModels,
    newAttribute: {
      name: name,
      type: types
    }
  };
}

export { processArray };
