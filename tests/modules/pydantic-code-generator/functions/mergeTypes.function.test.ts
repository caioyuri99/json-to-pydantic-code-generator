import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { mergeTypes } from "../../../../src/modules/pydantic-code-generator/functions/mergeTypes.function";

describe("mergeTypes", () => {
  test("should merge two TypeSets", () => {
    const set1 = new TypeSet<string>(["int", "str"]);
    const set2 = new TypeSet<string>(["bool", "float"]);
    const result = mergeTypes(set1, set2);
    expect(result).toEqual(
      new TypeSet<string>(["int", "str", "bool", "float"])
    );
  });

  test("should add a ListSet to a Set", () => {
    const set = new TypeSet<string>(["int", "str"]);
    const listSet = new ListSet<string>(["float"]);
    const result = mergeTypes(set, listSet);
    expect(result).toEqual(new TypeSet<string>(["int", "str", listSet]));
  });

  test("should merge ListSets correctly", () => {
    const listSet1 = new ListSet<string>(["int"]);
    const listSet2 = new ListSet<string>(["str"]);
    const result = mergeTypes(listSet1, listSet2);

    expect(result).toEqual(new ListSet<string>(["int", "str"]));
  });

  test("should merge a ListSet into an existing Set containing another ListSet", () => {
    const listSet1 = new ListSet<string>(["int"]);

    const listSet2 = new ListSet<string>(["str"]);

    const set = new TypeSet<string>(["bool", listSet1]);

    const result = mergeTypes(set, listSet2);
    expect(result).toEqual(
      new TypeSet<string>(["bool", new ListSet<string>(["int", "str"])])
    );
  });

  test("should merge ListSets into ListSets", () => {
    const listSet1 = new ListSet<string>(["int", new ListSet<string>(["str"])]);
    const listSet2 = new ListSet<string>([
      "bool",
      new ListSet<string>(["float"])
    ]);

    const result = mergeTypes(listSet1, listSet2);
    expect(result).toEqual(
      new ListSet<string>([
        "int",
        "bool",
        new ListSet<string>(["str", "float"])
      ])
    );
  });

  test("should merge ListSets into TypeSets", () => {
    const typeSet1 = new TypeSet<string>(["int", new ListSet<string>(["str"])]);
    const typeSet2 = new TypeSet<string>([
      "bool",
      new ListSet<string>(["float"])
    ]);

    const result = mergeTypes(typeSet1, typeSet2);
    expect(result).toEqual(
      new TypeSet<string>([
        "int",
        "bool",
        new ListSet<string>(["str", "float"])
      ])
    );
  });

  test("should add oldTypes to typeToAdd when oldTypes is a ListSet and typeToAdd is a TypeSet and the return typeToAdd", () => {
    const oldTypes = new ListSet<string>(["int"]);
    const typeToAdd = new TypeSet<string>(["str"]);

    const result = mergeTypes(oldTypes, typeToAdd);
    expect(result).toEqual(new TypeSet<string>(["str", new ListSet(["int"])]));
  });
});
