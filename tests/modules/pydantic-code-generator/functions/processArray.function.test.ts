import { processArray } from "../../../../src/modules/pydantic-code-generator/functions/processArray.function";

describe("processArray", () => {
  test("should return ClassAttribute with List[int] for homogeneous number array", () => {
    const result = processArray([1, 2, 3], "numbers");
    expect(result).toEqual({
      generatedClassModels: [],
      newAttribute: { name: "numbers", type: "List[int]" }
    });
  });

  test("should return ClassAttribute with List[str] for homogeneous string array", () => {
    const result = processArray(["a", "b", "c"], "letters");
    expect(result).toEqual({
      generatedClassModels: [],
      newAttribute: { name: "letters", type: "List[str]" }
    });
  });

  test("should return ClassAttribute with List[bool] for homogeneous boolean array", () => {
    const result = processArray([true, false, true], "flags");
    expect(result).toEqual({
      generatedClassModels: [],
      newAttribute: { name: "flags", type: "List[bool]" }
    });
  });

  test("should return ClassAttribute with List[Any] for heterogeneous array", () => {
    const result = processArray([1, "a", true], "mixed");
    expect(result).toEqual({
      generatedClassModels: [],
      newAttribute: { name: "mixed", type: "List[Any]" }
    });
  });

  test("should return ClassModel[] for an array of objects", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "name", type: "str" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should process nested objects into ClassModels", () => {
    const input = [
      {
        id: 1,
        profile: { age: 25, city: "New York" }
      },
      {
        id: 2,
        profile: { age: 30, city: "San Francisco" }
      }
    ];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "Profile",
          attributes: [
            { name: "age", type: "int" },
            { name: "city", type: "str" }
          ]
        },
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "profile", type: "Profile" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should process nested arrays of objects into ClassModels", () => {
    const input = [
      {
        id: 1,
        friends: [
          { name: "Alice", age: 25 },
          { name: "Bob", age: 30 }
        ]
      }
    ];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "Friends",
          attributes: [
            { name: "name", type: "str" },
            { name: "age", type: "int" }
          ]
        },
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "friends", type: "List[Friends]" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should return ClassAttribute with Set containing multiple types for mixed attribute types", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: "2", name: "Bob" }
    ];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: new Set(["int", "str"]) },
            { name: "name", type: "str" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should include Any in type when attribute is missing in some objects", () => {
    const input = [{ id: 1, name: "Alice" }, { id: 2 }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "name", type: new Set(["str", "Any"]) }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should process lists of primitive types inside objects", () => {
    const input = [
      { id: 1, tags: ["python", "typescript"] },
      { id: 2, tags: ["javascript"] }
    ];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "tags", type: "List[str]" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should return List[Any] for heterogeneous lists inside objects", () => {
    const input = [{ id: 1, values: [1, "text", true] }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "values", type: "List[Any]" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should handle lists of lists of primitive types", () => {
    const input = [
      {
        id: 1,
        matrix: [
          [1, 2],
          [3, 4]
        ]
      }
    ];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "matrix", type: "List[List[int]]" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should handle lists of lists with mixed primitive types", () => {
    const input = [
      {
        id: 1,
        matrix: [
          [1, "text"],
          [true, 3.5]
        ]
      }
    ];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "matrix", type: "List[List[Any]]" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should handle deeply nested structures", () => {
    const input = [
      { id: 1, metadata: { details: { verified: true, level: 5 } } }
    ];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "Details",
          attributes: [
            { name: "verified", type: "bool" },
            { name: "level", type: "int" }
          ]
        },
        {
          className: "Metadata",
          attributes: [{ name: "details", type: "Details" }]
        },
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "metadata", type: "Metadata" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should handle deeply nested lists of objects", () => {
    const input = [{ id: 1, data: [[{ value: 10 }], [{ value: 20 }]] }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "Data",
          attributes: [{ name: "value", type: "int" }]
        },
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "data", type: "List[List[Data]]" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });

  test("should handle lists of lists where some inner lists contain objects and others contain primitives", () => {
    const input = [{ id: 1, mixed: [[{ value: 10 }], ["string"]] }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            { name: "mixed", type: "List[List[Any]]" }
          ]
        }
      ],
      newAttribute: { name: "user", type: "List[User]" }
    });
  });
});
