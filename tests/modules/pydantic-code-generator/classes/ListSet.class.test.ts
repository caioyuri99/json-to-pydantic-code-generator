import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";

describe("ListSet", () => {
  test("ListSet.toString() with single element", () => {
    const set = new ListSet(["User"]);
    expect(set.toString()).toBe("ListSet { User }");
  });

  test("ListSet.toString() with multiple elements", () => {
    const set = new ListSet(["User", "Admin"]);
    expect(set.toString()).toBe("ListSet { User, Admin }");
  });

  test("ListSet.toString() with nested ListSet", () => {
    const nested = new ListSet(["Tag"]);
    const outer = new ListSet(["Comment", nested]);
    expect(outer.toString()).toBe("ListSet { Comment, ListSet { Tag } }");
  });

  test("ListSet.toString() with deeply nested ListSet", () => {
    const inner = new ListSet(["Tag"]);
    const middle = new ListSet(["Comment", inner]);
    const outer = new ListSet(["Post", middle]);
    expect(outer.toString()).toBe(
      "ListSet { Post, ListSet { Comment, ListSet { Tag } } }"
    );
  });
});
