import { ListSet } from "../classes/ListSet.class.js";
import { TypeSet } from "../classes/TypeSet.class.js";
import { addType } from "../utils/utils.module.js";

function mergeTypes(
  oldTypes: TypeSet<string> | ListSet<string>,
  typeToAdd: TypeSet<string> | ListSet<string>
): TypeSet<string> | ListSet<string> {
  if (oldTypes instanceof ListSet) {
    if (typeToAdd instanceof ListSet) {
      return addType(oldTypes, ...typeToAdd);
    }

    return addType(typeToAdd, oldTypes);
  }

  if (oldTypes instanceof TypeSet) {
    if (typeToAdd instanceof TypeSet) {
      typeToAdd.forEach((e) => addType(oldTypes, e));

      return oldTypes;
    }
  }

  return addType(oldTypes, typeToAdd);
}

export { mergeTypes };
