import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";

describe("TypeSet", () => {
  test("TypeSet.toString() with single element", () => {
    const set = new TypeSet(["User"]);
    expect(set.toString()).toBe("TypeSet { User }");
  });

  test("TypeSet.toString() with multiple elements", () => {
    const set = new TypeSet(["User", "Admin"]);
    expect(set.toString()).toBe("TypeSet { User, Admin }");
  });

  test("TypeSet.toString() with nested TypeSet", () => {
    const nested = new TypeSet(["Tag"]);
    const outer = new TypeSet(["Comment", nested]);
    expect(outer.toString()).toBe("TypeSet { Comment, TypeSet { Tag } }");
  });

  test("TypeSet.toString() with deeply nested TypeSet", () => {
    const inner = new ListSet(["Tag"]);
    const middle = new ListSet(["Comment", inner]);
    const outer = new TypeSet(["Post", middle]);
    expect(outer.toString()).toBe(
      "TypeSet { Post, ListSet { Comment, ListSet { Tag } } }"
    );
  });
});
