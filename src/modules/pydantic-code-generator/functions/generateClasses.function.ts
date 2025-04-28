import { ClassModel } from "../types/ClassModel.type";
import { getType } from "./getType.function";
import { processArray } from "./processArray.function";
import { ClassAttribute } from "../types/ClassAttribute.type";
import { capitalize, getNonDuplicateName } from "../utils/utils.module";
import { TypeSet } from "../classes/TypeSet.class";

// TODO: adicionar flag preferClassReuse: define se vai reutilizar classes geradas anteriormente para tipar as novas classes geradas
// TODO: adicionar flag mergeEqualNameClasses: define se vai fazer o merge de classes com nomes iguais

function generateClasses(
  json: any,
  name: string = "Model",
  existentClassNames: string[] = []
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
        getNonDuplicateName(capitalize(key), ecn),
        ecn
      );

      res.push(...generatedClasses);

      const lastGeneratedClass = generatedClasses.at(-1);

      if (lastGeneratedClass) {
        obj.attributes.push({
          name: key,
          type: new TypeSet([lastGeneratedClass.className])
        });
      }
    } else if (Array.isArray(value)) {
      const processedArray = processArray(value, key, ecn);
      const generatedClassModels = processedArray.generatedClassModels;

      res.push(...generatedClassModels);

      const newAttribute = processedArray.newAttribute;

      obj.attributes.push(newAttribute);
    } else {
      obj.attributes.push({ name: key, type: new TypeSet([getType(value)]) });
    }
  }

  res.push(obj);

  return res;
}

export { generateClasses };
