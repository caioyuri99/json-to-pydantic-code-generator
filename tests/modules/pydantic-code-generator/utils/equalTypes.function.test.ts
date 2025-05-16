import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { equalTypes } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("equalTypes", () => {
  test("equal TypeSets with same elements", () => {
    const a = new TypeSet(["str", "int"]);
    const b = new TypeSet(["int", "str"]);
    expect(equalTypes(a, b)).toBe(true);
  });

  test("unequal TypeSets with different elements", () => {
    const a = new TypeSet(["str", "int"]);
    const b = new TypeSet(["str", "float"]);
    expect(equalTypes(a, b)).toBe(false);
  });

  test("equal ListSets with same structure", () => {
    const a = new ListSet(["str", "int"]);
    const b = new ListSet(["int", "str"]);
    expect(equalTypes(a, b)).toBe(true);
  });

  test("unequal ListSets with different structure", () => {
    const a = new ListSet(["str", "int"]);
    const b = new ListSet(["str", "float"]);
    expect(equalTypes(a, b)).toBe(false);
  });

  test("TypeSet with ListSet equals another TypeSet with equivalent ListSet", () => {
    const listA = new ListSet(["str", "int"]);
    const listB = new ListSet(["int", "str"]);
    const a = new TypeSet(["bool", listA]);
    const b = new TypeSet([listB, "bool"]);
    expect(equalTypes(a, b)).toBe(true);
  });

  test("TypeSet with ListSet differs from one with different ListSet", () => {
    const listA = new ListSet(["str", "int"]);
    const listB = new ListSet(["float", "int"]);
    const a = new TypeSet(["bool", listA]);
    const b = new TypeSet([listB, "bool"]);
    expect(equalTypes(a, b)).toBe(false);
  });

  test("ListSet with nested ListSet (equal)", () => {
    const inner1 = new ListSet(["str"]);
    const inner2 = new ListSet(["str"]);
    const a = new ListSet([inner1, "int"]);
    const b = new ListSet(["int", inner2]);
    expect(equalTypes(a, b)).toBe(true);
  });

  test("ListSet with nested ListSet (different)", () => {
    const inner1 = new ListSet(["str"]);
    const inner2 = new ListSet(["float"]);
    const a = new ListSet([inner1, "int"]);
    const b = new ListSet(["int", inner2]);
    expect(equalTypes(a, b)).toBe(false);
  });

  test("TypeSet vs ListSet should always return false", () => {
    const a = new TypeSet(["str"]);
    const b = new ListSet(["str"]);
    expect(equalTypes(a, b)).toBe(false);
    expect(equalTypes(b, a)).toBe(false);
  });

  test("should return false if the size of Sets are different", () => {
    const typeSetA = new TypeSet(["int"]);
    const typeSetB = new TypeSet(["int", "str"]);

    const listSetA = new ListSet(["int"]);
    const listSetB = new ListSet(["int", "str"]);

    expect(equalTypes(typeSetA, typeSetB)).toBe(false);
    expect(equalTypes(listSetA, listSetB)).toBe(false);
  });
});
