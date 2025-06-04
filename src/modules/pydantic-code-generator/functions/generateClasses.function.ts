import { ClassModel } from "../types/ClassModel.type";
import { getType } from "./getType.function";
import { processArray } from "./processArray.function";
import { ClassAttribute } from "../types/ClassAttribute.type";
import {
  getClassName,
  getNonDuplicateName,
  replaceType
} from "../utils/utils.module";
import { TypeSet } from "../classes/TypeSet.class";
import { reuseClasses } from "./reuseClasses.function";

function generateClasses(
  json: any,
  name: string = "Model",
  existentClassNames: string[] = [],
  preferClassReuse = false
): ClassModel[] {
  const res: ClassModel[] = [];
  const obj: ClassModel = {
    className: name,
    attributes: []
  };

  if (typeof json === "object" && Array.isArray(json)) {
    if (
      json.some((e) => typeof e !== "object" || Array.isArray(e)) ||
      json.length === 0
    ) {
      throw new Error("Input must be an object or an array of objects");
    }

    return processArray(json, undefined, undefined, true).generatedClassModels;
  }

  for (const [key, value] of Object.entries(json)) {
    const ecn = existentClassNames.concat(res.map((e) => e.className));
    ecn.push(name);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const generatedClasses = generateClasses(
        value,
        getNonDuplicateName(getClassName(key), ecn),
        ecn
      );

      if (preferClassReuse) {
        reuseClasses(res, generatedClasses);
      } else {
        res.push(...generatedClasses);
      }

      const lastGeneratedClass = res.at(-1);

      if (lastGeneratedClass) {
        obj.attributes.push({
          name: key,
          type: new TypeSet([lastGeneratedClass.className])
        });
      }
    } else if (Array.isArray(value)) {
      const processedArray = processArray(value, key, ecn, preferClassReuse);
      const generatedClassModels = processedArray.generatedClassModels;
      const newAttribute = processedArray.newAttribute;

      if (preferClassReuse) {
        reuseClasses(res, generatedClassModels, newAttribute);
      } else {
        res.push(...generatedClassModels);
      }

      obj.attributes.push(newAttribute);
    } else {
      obj.attributes.push({ name: key, type: new TypeSet([getType(value)]) });
    }
  }

  res.push(obj);

  return res;
}

export { generateClasses };
