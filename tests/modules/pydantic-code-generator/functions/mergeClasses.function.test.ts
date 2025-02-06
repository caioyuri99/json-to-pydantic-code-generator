import { mergeClasses } from "../../../../src/modules/pydantic-code-generator/functions/mergeClasses.function";
import { ClassModel } from "../../../../src/modules/pydantic-code-generator/types/ClassModel.type";

describe("mergeClasses", () => {
  test("empty input", () => {
    const objects: ClassModel[] = [];

    expect(mergeClasses(objects)).toEqual([]);
  });

  test("no duplication", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      {
        className: "Product",
        attributes: [{ name: "price", type: "float" }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(objects));
  });

  test("identical classes with different attributes", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      { className: "User", attributes: [{ name: "email", type: "str" }] }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new Set(["Any", "int"]) },
          { name: "email", type: new Set(["Any", "str"]) }
        ]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("duplicate attributes and conflicting types", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      { className: "User", attributes: [{ name: "id", type: "str" }] }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: new Set(["int", "str"]) }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("multiple classes with partial merging", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      { className: "User", attributes: [{ name: "email", type: "str" }] },
      {
        className: "Product",
        attributes: [{ name: "price", type: "float" }]
      }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new Set(["Any", "int"]) },
          { name: "email", type: new Set(["Any", "str"]) }
        ]
      },
      {
        className: "Product",
        attributes: [{ name: "price", type: "float" }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("multiple levels of duplication", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      { className: "User", attributes: [{ name: "email", type: "str" }] },
      { className: "User", attributes: [{ name: "email", type: "str" }] },
      { className: "User", attributes: [{ name: "id", type: "int" }] }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new Set(["Any", "int"]) },
          { name: "email", type: new Set(["Any", "str"]) }
        ]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expected);
  });
});
