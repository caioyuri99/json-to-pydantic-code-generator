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

    expect(result).toEqual(new Set(["int", "str"]));
  });

  test("Should return oldTypes as a Set and add typeToAdd when oldTypes is already a Set", () => {
    const oldTypes = new Set(["bool", "str"]);
    const typeToAdd = "float";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["bool", "float", "str"]));
  });

  test("Should handle adding a duplicate type to an existing Set", () => {
    const oldTypes = new Set(["int", "str"]);
    const typeToAdd = "str";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["int", "str"]));
  });

  test("Should handle adding an empty Set to oldTypes as a string", () => {
    const oldTypes = "str";
    const typeToAdd = new Set<string>();

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str"]));
  });

  test("Should handle adding a non-empty Set to oldTypes as a string", () => {
    const oldTypes = "str";
    const typeToAdd = new Set(["bool", "int"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["bool", "int", "str"]));
  });

  test("Should handle adding a Set to oldTypes as an existing Set", () => {
    const oldTypes = new Set(["str"]);
    const typeToAdd = new Set(["bool", "float"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["bool", "float", "str"]));
  });

  test("Should handle adding an empty Set to oldTypes as an existing Set", () => {
    const oldTypes = new Set(["str"]);
    const typeToAdd = new Set<string>();

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str"]));
  });

  test("Should handle merging two identical Sets", () => {
    const oldTypes = new Set(["int", "str"]);
    const typeToAdd = new Set(["int", "str"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["int", "str"]));
  });

  test("should return only float if there is int and float types in input parameters", () => {
    const oldTypes1 = new Set(["int", "str"]);
    const typeToAdd1 = "float";

    const r1 = mergeTypes(oldTypes1, typeToAdd1);
    expect(r1).toEqual(new Set(["float", "str"]));

    const oldTypes2 = new Set(["float", "str"]);
    const typeToAdd2 = "int";

    const r2 = mergeTypes(oldTypes2, typeToAdd2);
    expect(r2).toEqual(new Set(["float", "str"]));

    const oldTypes3 = new Set(["int", "str"]);
    const typeToAdd3 = new Set(["float", "str"]);

    const r3 = mergeTypes(oldTypes3, typeToAdd3);
    expect(r3).toEqual(new Set(["float", "str"]));

    const oldTypes4 = new Set(["float", "str"]);
    const typeToAdd4 = new Set(["int", "str"]);

    const r4 = mergeTypes(oldTypes4, typeToAdd4);
    expect(r4).toEqual(new Set(["float", "str"]));

    const oldTypes5 = "float";
    const typeToAdd5 = "int";

    const r5 = mergeTypes(oldTypes5, typeToAdd5);
    expect(r5).toEqual(new Set(["float"]));

    const oldTypes6 = "int";
    const typeToAdd6 = "float";

    const r6 = mergeTypes(oldTypes6, typeToAdd6);
    expect(r6).toEqual(new Set(["float"]));
  });
});
