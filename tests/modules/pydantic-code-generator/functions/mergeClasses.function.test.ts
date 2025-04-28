import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { mergeClasses } from "../../../../src/modules/pydantic-code-generator/functions/mergeClasses.function";
import { ClassModel } from "../../../../src/modules/pydantic-code-generator/types/ClassModel.type";

describe("mergeClasses", () => {
  test("empty input", () => {
    const objects: ClassModel[] = [];

    expect(mergeClasses(objects)).toEqual([]);
  });

  test("no duplication", () => {
    const objects: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
      },
      {
        className: "Product",
        attributes: [{ name: "price", type: new TypeSet<string>(["float"]) }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(objects));
  });

  test("identical classes with different attributes", () => {
    const objects: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
      },
      {
        className: "User",
        attributes: [{ name: "email", type: new TypeSet<string>(["str"]) }]
      }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet<string>(["Any", "int"]) },
          { name: "email", type: new TypeSet<string>(["Any", "str"]) }
        ]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("duplicate attributes and conflicting types", () => {
    const objects: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
      },
      {
        className: "User",
        attributes: [{ name: "id", type: new TypeSet<string>(["str"]) }]
      }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: new TypeSet<string>(["int", "str"]) }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("multiple classes with partial merging", () => {
    const objects: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
      },
      {
        className: "User",
        attributes: [{ name: "email", type: new TypeSet<string>(["str"]) }]
      },
      {
        className: "Product",
        attributes: [{ name: "price", type: new TypeSet<string>(["float"]) }]
      }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet<string>(["Any", "int"]) },
          { name: "email", type: new TypeSet<string>(["Any", "str"]) }
        ]
      },
      {
        className: "Product",
        attributes: [{ name: "price", type: new TypeSet<string>(["float"]) }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("multiple levels of duplication", () => {
    const objects: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
      },
      {
        className: "User",
        attributes: [{ name: "email", type: new TypeSet<string>(["str"]) }]
      },
      {
        className: "User",
        attributes: [{ name: "email", type: new TypeSet<string>(["str"]) }]
      },
      {
        className: "User",
        attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
      }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet<string>(["Any", "int"]) },
          { name: "email", type: new TypeSet<string>(["Any", "str"]) }
        ]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expected);
  });
});
