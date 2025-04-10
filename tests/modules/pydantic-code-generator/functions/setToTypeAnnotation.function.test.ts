import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { setToTypeAnnotation } from "../../../../src/modules/pydantic-code-generator/functions/setToTypeAnnotation.function";

describe("setToTypeAnnotation", () => {
  test("Should return a single type when Set contains one element", () => {
    const input = new Set(["str"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("str");
  });

  test("Should return a Union of types when Set contains multiple elements", () => {
    const input = new Set(["str", "int"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Union[int, str]");
  });

  test("Should remove int when Set has float and int type", () => {
    const input = new Set(["str", "int", "float"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Union[float, str]");
  });

  test("Should handle a Set with multiple elements in arbitrary order", () => {
    const input = new Set(["float", "bool", "str"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Union[bool, float, str]");
  });

  test("Should handle a Set with duplicate elements by removing duplicates", () => {
    const input = new Set(["str", "int", "str"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Union[int, str]");
  });

  test("Should handle a Set with a single element 'Any'", () => {
    const input = new Set(["Any"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Any");
  });

  test("Should return Optional[type] when Set contains 'Any' and one other type", () => {
    const input = new Set(["str", "Any"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Optional[str]");
  });

  test("Should return Optional[Union[...]] when Set contains 'Any' and multiple types", () => {
    const input = new Set(["str", "int", "Any"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Optional[Union[int, str]]");
  });

  test("Should return List[Type] when ListSet contains only one element", () => {
    const ls = new ListSet<string>();
    ls.add("int");
    expect(setToTypeAnnotation(ls)).toBe("List[int]");
  });

  test("Should return List[Union[Type1, Type2, ...]] when ListSet contains multiple elements", () => {
    const ls = new ListSet<string>(["int", "str", "float"]);
    expect(setToTypeAnnotation(ls)).toBe("List[Union[float, str]]");
  });

  test("Should return List[List[Type]] when ListSet contains another ListSet", () => {
    const inner = new ListSet<string>(["int"]);

    const outer = new ListSet<string>([inner]);

    expect(setToTypeAnnotation(outer)).toBe("List[List[int]]");
  });

  test("Should return List[Union[List[Type], Type1]] when ListSet contains another ListSet and a type", () => {
    const inner = new ListSet<string>(["int", "float"]);

    const outer = new ListSet<string>(["str", inner]);

    expect(setToTypeAnnotation(outer)).toBe("List[Union[List[float], str]]");
  });

  test("Should return Union[List[Type], Type1] when Set contains a ListSet and a type", () => {
    const listSet = new ListSet<string>(["int", "float"]);

    const input = new Set<string | ListSet<string>>([listSet, "str"]);

    expect(setToTypeAnnotation(input)).toBe("Union[List[float], str]");
  });

  test("Should return Optional[List[Union[Type1, Type2, ...]]] when Set contains Any and a ListSet with multiple elements", () => {
    const listSet = new ListSet<string>(["str", "int", "float"]);

    const input = new Set<string | ListSet<string>>(["Any", listSet]);

    expect(setToTypeAnnotation(input)).toBe(
      "Optional[List[Union[float, str]]]"
    );
  });

  test("Should return Optional[Union[List[Type], Type1, Type2, ...] when Set contains Any, a ListSet and other types", () => {
    const ls = new ListSet<string>(["int", "float"]);

    const s = new Set<string | ListSet<string>>(["Any", ls, "float", "str"]);

    expect(setToTypeAnnotation(s)).toBe(
      "Optional[Union[List[float], float, str]]"
    );
  });
});
