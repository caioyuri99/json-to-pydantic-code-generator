import { ListSet } from "./ListSet.class.js";

class TypeSet<T> extends Set<T | ListSet<T>> {
  toString(): string {
    return `TypeSet { ${[...this].map(String).join(", ")} }`;
  }
}

export { TypeSet };
