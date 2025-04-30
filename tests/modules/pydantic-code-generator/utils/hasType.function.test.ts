import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { hasType } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("hasType", () => {
  test("finds a direct string in a TypeSet", () => {
    const set = new TypeSet(["User", "Admin"]);
    expect(hasType(set, "Admin")).toBe(true);
  });

  test("returns false for string not in TypeSet", () => {
    const set = new TypeSet(["User", "Admin"]);
    expect(hasType(set, "Guest")).toBe(false);
  });

  test("finds string inside a nested ListSet", () => {
    const nested = new ListSet(["Comment"]);
    const set = new TypeSet(["User", nested]);
    expect(hasType(set, "Comment")).toBe(true);
  });

  test("does not find string not in nested ListSet", () => {
    const nested = new ListSet(["Post"]);
    const set = new TypeSet(["User", nested]);
    expect(hasType(set, "Comment")).toBe(false);
  });

  test("finds deeply nested value in ListSet", () => {
    const deep = new ListSet([new ListSet(["Tag"])]);
    const set = new TypeSet(["User", deep]);
    expect(hasType(set, "Tag")).toBe(true);
  });

  test("returns true for direct string in ListSet", () => {
    const listSet = new ListSet(["Tag", "Category"]);
    expect(hasType(listSet, "Tag")).toBe(true);
  });

  test("returns false if value is not in ListSet", () => {
    const listSet = new ListSet(["Item"]);
    expect(hasType(listSet, "Product")).toBe(false);
  });
});
