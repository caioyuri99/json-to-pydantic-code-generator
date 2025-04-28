import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";

function setToTypeAnnotation(s: TypeSet<string> | ListSet<string>): string {
  if (s.has("int") && s.has("float")) {
    s.delete("int");
  }

  if (s instanceof ListSet) {
    if (s.size > 1) {
      return `List[Union[${[...s]
        .map((e) => {
          if (e instanceof ListSet) {
            return setToTypeAnnotation(e);
          }

          return e;
        })
        .sort()
        .join(", ")}]]`;
    }

    const uniqueElement = [...s][0];

    if (uniqueElement instanceof ListSet) {
      return `List[${setToTypeAnnotation(uniqueElement)}]`;
    }

    return `List[${uniqueElement}]`;
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
