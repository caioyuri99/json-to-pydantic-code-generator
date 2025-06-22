import { ListSet } from "../classes/ListSet.class.js";
import { TypeSet } from "../classes/TypeSet.class.js";

function setToTypeAnnotation(s: TypeSet<string> | ListSet<string>): string {
  if (s.has("int") && s.has("float")) {
    s.delete("int");
  }

  if (s instanceof ListSet) {
    if (s.size === 0) {
      return "List";
    }

    return `List[${setToTypeAnnotation(new Set([...s]))}]`;
  }

  if (s.size > 1) {
    if (s.delete("Any")) {
      return `Optional[${setToTypeAnnotation(s)}]`;
    }

    return `Union[${[...s]
      .map((e) => {
        if (e instanceof ListSet) {
          return setToTypeAnnotation(e);
        }

        return e;
      })
      .sort()
      .join(", ")}]`;
  }

  const uniqueElement = [...s][0];

  if (typeof uniqueElement === "string") {
    return uniqueElement;
  }

  return setToTypeAnnotation(uniqueElement);
}

export { setToTypeAnnotation };
