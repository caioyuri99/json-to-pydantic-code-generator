import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { replaceType } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("replaceType", () => {
  test("replaceType replaces value in TypeSet", () => {
    const set = new TypeSet(["A", "B", "C"]);

    replaceType(set, "B", "X");

    expect(set).toEqual(new TypeSet(["A", "X", "C"]));
  });

  test("replaceType does nothing if oldType not in TypeSet", () => {
    const set = new TypeSet(["A", "B"]);

    replaceType(set, "Z", "X");

    expect(set).toEqual(new TypeSet(["A", "B"]));
  });

  test("replaceType replaces value in ListSet", () => {
    const set = new ListSet(["int", "str"]);

    replaceType(set, "int", "float");

    expect(set).toEqual(new ListSet(["float", "str"]));
  });

  test("replaceType replaces value inside nested ListSet", () => {
    const set = new ListSet(["float", new ListSet(["str", "int"])]);

    replaceType(set, "int", "bool");

    expect(set).toEqual(new ListSet(["float", new ListSet(["str", "bool"])]));
  });

  test("replaceType replaces all occurrences of oldType", () => {
    const set = new ListSet(["A", "B", new ListSet(["A"])]);

    replaceType(set, "A", "Z");

    expect(set).toEqual(new ListSet(["Z", "B", new ListSet("Z")]));
  });

  test("replaceType replaces deeply nested oldType", () => {
    const set = new ListSet([new ListSet([new ListSet(["A"])])]);

    replaceType(set, "A", "B");

    expect(set).toEqual(new ListSet([new ListSet([new ListSet(["B"])])]));
  });

  test("replaceType preserves unrelated types", () => {
    const set = new TypeSet(["foo", "bar"]);

    replaceType(set, "foo", "baz");

    expect(set).toEqual(new TypeSet(["baz", "bar"]));
  });
});
