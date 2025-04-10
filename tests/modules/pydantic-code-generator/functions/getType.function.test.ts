import { getType } from "../../../../src/modules/pydantic-code-generator/functions/getType.function";

describe("getType", () => {
  test("Should return 'str' for a string input", () => {
    expect(getType("hello")).toBe("str");
  });

  test("Should return 'int' for an integer input", () => {
    expect(getType(42)).toBe("int");
  });

  test("Should return 'float' for a float input", () => {
    expect(getType(3.14)).toBe("float");
  });

  test("Should return 'bool' for a boolean input", () => {
    expect(getType(true)).toBe("bool");
    expect(getType(false)).toBe("bool");
  });

  test("Should return 'Any' for an undefined or null input", () => {
    expect(getType(undefined)).toBe("Any");
    expect(getType(null)).toBe("Any");
  });

  test("Should return 'Any' for an array input", () => {
    expect(getType([1, 2, 3])).toBe("Any");
  });

  test("Should return 'Any' for an object input", () => {
    expect(getType({ key: "value" })).toBe("Any");
  });

  test("Should return 'Any' for a function input", () => {
    expect(getType(() => {})).toBe("Any");
  });

  test("Should return 'str' for a string literal", () => {
    expect(getType("test")).toBe("str");
  });

  test("Should return 'int' for a number literal", () => {
    expect(getType(100)).toBe("int");
  });

  test("Should return 'bool' for a boolean literal", () => {
    expect(getType(false)).toBe("bool");
    expect(getType(true)).toBe("bool");
  });

  test("Should return 'float' for a floating-point literal", () => {
    expect(getType(1.23)).toBe("float");
  });
});
