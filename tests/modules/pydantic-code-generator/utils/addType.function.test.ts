import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { addType } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("addType", () => {
  test("adds multiple strings to a TypeSet and mutates original", () => {
    const set = new TypeSet(["User"]);
    const result = addType(set, "Admin", "Guest");

    expect(result).toBe(set);
    expect(set).toEqual(new TypeSet(["User", "Admin", "Guest"]));
  });

  test("adds multiple strings to a ListSet and mutates original", () => {
    const set = new ListSet(["Item"]);
    const result = addType(set, "Thing", "Object");

    expect(result).toBe(set);
    expect(set).toEqual(new ListSet(["Item", "Thing", "Object"]));
  });

  test("adds multiple values including a ListSet into a TypeSet", () => {
    const set = new TypeSet(["User"]);
    const nested = new ListSet(["Tag"]);
    const result = addType(set, "Admin", nested);

    expect(result).toBe(set);
    expect(set).toEqual(new TypeSet(["User", "Admin", new ListSet(["Tag"])]));
  });

  test("deep merge of ListSets into an existing nested ListSet", () => {
    const nested = new ListSet(["A"]);
    const outer = new ListSet(["Root", nested]);
    const incoming1 = new ListSet(["B"]);
    const incoming2 = new ListSet(["C"]);

    const result = addType(outer, incoming1, incoming2);

    expect(result).toBe(outer);

    const mergedNested = [...outer].find(
      (v) => v instanceof ListSet
    ) as ListSet<string>;
    expect(mergedNested).toEqual(new ListSet(["A", "B", "C"]));
  });

  test("throws when trying to add a TypeSet", () => {
    const set = new TypeSet(["X"]);
    const invalid = new TypeSet(["Y"]);
    expect(() => addType(set, "Z", invalid)).toThrow();
  });

  test("throws when adding two ListSets into the same set", () => {
    const set = new TypeSet(["A"]);
    const l1 = new ListSet(["B"]);
    const l2 = new ListSet(["C"]);

    expect(addType(set, l1, l2)).toEqual(
      new TypeSet(["A", new ListSet(["B", "C"])])
    );
  });
});
