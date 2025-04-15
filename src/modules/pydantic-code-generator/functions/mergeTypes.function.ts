import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";

export function mergeTypes(
  oldTypes: TypeSet<string> | ListSet<string>,
  typeToAdd: TypeSet<string> | ListSet<string>
): TypeSet<string> | ListSet<string> {
  if (oldTypes instanceof ListSet) {
    if (typeToAdd instanceof ListSet) {
      return new ListSet<string>([...oldTypes, ...typeToAdd]);
    }

    return typeToAdd.add(oldTypes);
  }

  if (oldTypes instanceof TypeSet) {
    if (typeToAdd instanceof TypeSet) {
      typeToAdd.forEach((e) => oldTypes.add(e));

      return oldTypes;
    }
  }

  return oldTypes.add(typeToAdd);
}
