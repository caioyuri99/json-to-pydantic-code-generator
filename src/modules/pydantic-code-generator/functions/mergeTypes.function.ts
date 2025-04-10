import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";

export function mergeTypes(
  oldTypes: string | TypeSet<string> | ListSet<string>,
  typeToAdd: string | TypeSet<string> | ListSet<string>
): string | TypeSet<string> | ListSet<string> {
  if (typeof oldTypes === "string") {
    if (typeof typeToAdd === "string") {
      if (oldTypes === typeToAdd) {
        return oldTypes;
      }
    }

    if (typeToAdd instanceof TypeSet) {
      return typeToAdd.add(oldTypes);
    }

    return new TypeSet<string>([oldTypes, typeToAdd]);
  }

  if (oldTypes instanceof ListSet) {
    if (typeof typeToAdd === "string") {
      return new TypeSet<string>([oldTypes, typeToAdd]);
    }

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
