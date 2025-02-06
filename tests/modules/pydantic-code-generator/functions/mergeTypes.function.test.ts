import { mergeTypes } from "../../../../src/modules/pydantic-code-generator/functions/mergeTypes.function";

describe("mergeTypes", () => {
  test("Should return oldTypes when both oldTypes and typeToAdd are the same string", () => {
    const oldTypes = "str";
    const typeToAdd = "str";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toBe(oldTypes);
  });

  test("Should return a Set containing oldTypes and typeToAdd when they are different strings", () => {
    const oldTypes = "str";
    const typeToAdd = "int";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int"]));
  });

  test("Should return oldTypes as a Set and add typeToAdd when oldTypes is already a Set", () => {
    const oldTypes = new Set(["str", "int"]);
    const typeToAdd = "float";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int", "float"]));
  });

  test("Should handle adding a duplicate type to an existing Set", () => {
    const oldTypes = new Set(["str", "int"]);
    const typeToAdd = "str";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int"]));
  });

  test("Should handle adding an empty Set to oldTypes as a string", () => {
    const oldTypes = "str";
    const typeToAdd = new Set<string>();

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str"]));
  });

  test("Should handle adding a non-empty Set to oldTypes as a string", () => {
    const oldTypes = "str";
    const typeToAdd = new Set(["int", "float"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int", "float"]));
  });

  test("Should handle adding a Set to oldTypes as an existing Set", () => {
    const oldTypes = new Set(["str"]);
    const typeToAdd = new Set(["int", "float"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int", "float"]));
  });

  test("Should handle adding an empty Set to oldTypes as an existing Set", () => {
    const oldTypes = new Set(["str"]);
    const typeToAdd = new Set<string>();

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str"]));
  });

  test("Should handle merging two identical Sets", () => {
    const oldTypes = new Set(["str", "int"]);
    const typeToAdd = new Set(["str", "int"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int"]));
  });
});
