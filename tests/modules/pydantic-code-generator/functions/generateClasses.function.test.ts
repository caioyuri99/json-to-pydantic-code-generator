import { generateClasses } from "../../../../src/modules/pydantic-code-generator/functions/generateClasses.function";

describe("generateClasses", () => {
  test("Should throw an error when input is not an array of objects", () => {
    expect(() => generateClasses([42, { name: "Alice" }])).toThrow(
      new Error("Input must be an object or an array of objects")
    );

    expect(() => generateClasses([])).toThrow(
      new Error("Input must be an object or an array of objects")
    );
  });

  test("should generate a single class for a flat object", () => {
    const json = { id: 1, name: "Alice", age: 30 };

    const result = generateClasses(json, "Person");

    expect(result).toEqual([
      {
        className: "Person",
        attributes: [
          { name: "id", type: "int" },
          { name: "name", type: "str" },
          { name: "age", type: "int" }
        ]
      }
    ]);
  });

  test("should generate nested classes for an object with nested objects", () => {
    const json = {
      user: { id: 1, profile: { bio: "Hello", website: "example.com" } }
    };

    const result = generateClasses(json, "Root");

    expect(result).toEqual([
      {
        className: "Profile",
        attributes: [
          { name: "bio", type: "str" },
          { name: "website", type: "str" }
        ]
      },
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "profile", type: "Profile" }
        ]
      },
      {
        className: "Root",
        attributes: [{ name: "user", type: "User" }]
      }
    ]);
  });

  test("should generate a list of objects as a separate class", () => {
    const json = {
      users: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" }
      ]
    };

    const result = generateClasses(json, "Root");

    expect(result).toEqual([
      {
        className: "Users",
        attributes: [
          { name: "id", type: "int" },
          { name: "name", type: "str" }
        ]
      },
      {
        className: "Root",
        attributes: [{ name: "users", type: "List[Users]" }]
      }
    ]);
  });

  test("should generate types with Any for missing attributes in some objects", () => {
    const json = {
      items: [{ id: 1, value: "A" }, { id: 2 }]
    };

    const result = generateClasses(json, "Root");

    expect(result).toEqual([
      {
        className: "Items",
        attributes: [
          { name: "id", type: "int" },
          { name: "value", type: new Set(["str", "Any"]) }
        ]
      },
      {
        className: "Root",
        attributes: [{ name: "items", type: "List[Items]" }]
      }
    ]);
  });

  test("should handle lists of lists correctly", () => {
    const json = {
      matrix: [
        [1, 2, 3],
        [4, 5, 6]
      ]
    };

    const result = generateClasses(json, "Root");

    expect(result).toEqual([
      {
        className: "Root",
        attributes: [{ name: "matrix", type: "List[List[int]]" }]
      }
    ]);
  });

  test("should handle deeply nested lists of objects", () => {
    const json = {
      data: [[{ id: 1, name: "A" }], [{ id: 2, name: "B" }]]
    };

    const result = generateClasses(json, "Root");

    expect(result).toEqual([
      {
        className: "Data",
        attributes: [
          { name: "id", type: "int" },
          { name: "name", type: "str" }
        ]
      },
      {
        className: "Root",
        attributes: [{ name: "data", type: "List[List[Data]]" }]
      }
    ]);
  });
});
