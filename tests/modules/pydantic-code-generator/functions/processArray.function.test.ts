import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { processArray } from "../../../../src/modules/pydantic-code-generator/functions/processArray.function";

describe("processArray", () => {
  test("should return ClassAttribute with ListSet containing 'int' for homogeneous number array", () => {
    const result = processArray([1, 2, 3], "numbers");
    expect(result).toStrictEqual({
      generatedClassModels: [],
      newAttribute: { name: "numbers", type: new ListSet<string>(["int"]) }
    });
  });

  test("should return ClassAttribute with ListSet containing 'str' for homogeneous string array", () => {
    const result = processArray(["a", "b", "c"], "letters");
    expect(result).toStrictEqual({
      generatedClassModels: [],
      newAttribute: { name: "letters", type: new ListSet<string>(["str"]) }
    });
  });

  test("should return ClassAttribute with ListSet containing 'bool' for homogeneous boolean array", () => {
    const result = processArray([true, false, true], "flags");
    expect(result).toStrictEqual({
      generatedClassModels: [],
      newAttribute: { name: "flags", type: new ListSet<string>(["bool"]) }
    });
  });

  test("should return ClassAttribute with ListSet containing <Type1, Type2, ...> for heterogeneous array", () => {
    const result = processArray([1, "a", true], "mixed");
    expect(result).toEqual({
      generatedClassModels: [],
      newAttribute: {
        name: "mixed",
        type: new ListSet<string>(["bool", "int", "str"])
      }
    });
  });

  test("should return ClassAttribute with ListSet containing ListSet containing <Type1, Type2, ...> for array of arrays", () => {
    const result = processArray(
      [
        [1, 2, 3],
        [4, 5, 6]
      ],
      "matrix"
    );

    expect(result).toEqual({
      generatedClassModels: [],
      newAttribute: {
        name: "matrix",
        type: new ListSet<string>([new ListSet<string>(["int"])])
      }
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
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
            { name: "friends", type: new ListSet<string>(["Friends"]) }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
            { name: "id", type: new TypeSet<string>(["int", "str"]) },
            { name: "name", type: "str" }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
            { name: "name", type: new TypeSet<string>(["str", "Any"]) }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
            { name: "tags", type: new ListSet<string>(["str"]) }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
    });
  });

  test("should return List[Union[Type1, Type2, ...]] for heterogeneous lists inside objects", () => {
    const input = [{ id: 1, values: [1, "text", true] }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            {
              name: "values",
              type: new ListSet<string>(["bool", "int", "str"])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
            {
              name: "matrix",
              type: new ListSet<string>([new ListSet<string>(["int"])])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
            {
              name: "matrix",
              type: new ListSet<string>([
                new ListSet<string>(["bool", "float", "str", "int"])
              ])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
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
            {
              name: "data",
              type: new ListSet<string>([new ListSet<string>(["Data"])])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
    });
  });

  test("should handle lists of lists where some inner lists contain objects and others contain primitives", () => {
    const input = [{ id: 1, mixed: [[{ value: 10 }], ["string"]] }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "Mixed",
          attributes: [{ name: "value", type: "int" }]
        },
        {
          className: "User",
          attributes: [
            { name: "id", type: "int" },
            {
              name: "mixed",
              type: new ListSet<string>([new ListSet<string>(["str", "Mixed"])])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["User"]) }
    });
  });
});
