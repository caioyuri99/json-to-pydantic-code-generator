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
});
