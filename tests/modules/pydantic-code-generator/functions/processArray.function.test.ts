import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { processArray } from "../../../../src/modules/pydantic-code-generator/functions/processArray.function";
import { serializeClasses } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

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

    const { generatedClassModels, newAttribute } = processArray(input, "user");

    expect(serializeClasses(generatedClassModels)).toEqual(
      serializeClasses([
        {
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "name", type: new TypeSet(["str"]) }
          ]
        }
      ])
    );

    expect(newAttribute).toEqual({
      name: "user",
      type: new ListSet<string>(["UserItem"])
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

    const { generatedClassModels, newAttribute } = processArray(input, "user");

    expect(serializeClasses(generatedClassModels)).toEqual(
      serializeClasses([
        {
          className: "Profile",
          attributes: [
            { name: "age", type: new TypeSet(["int"]) },
            { name: "city", type: new TypeSet(["str"]) }
          ]
        },
        {
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "profile", type: new TypeSet(["Profile"]) }
          ]
        }
      ])
    );

    expect(newAttribute).toEqual({
      name: "user",
      type: new ListSet<string>(["UserItem"])
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

    const result = processArray(input, "users");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "Friend",
          attributes: [
            { name: "name", type: new TypeSet(["str"]) },
            { name: "age", type: new TypeSet(["int"]) }
          ]
        },
        {
          className: "User",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "friends", type: new ListSet<string>(["Friend"]) }
          ]
        }
      ],
      newAttribute: { name: "users", type: new ListSet<string>(["User"]) }
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
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet<string>(["int", "str"]) },
            { name: "name", type: new TypeSet(["str"]) }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["UserItem"]) }
    });
  });

  test("should include Any in type when attribute is missing in some objects", () => {
    const input = [{ id: 1, name: "Alice" }, { id: 2 }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "name", type: new TypeSet<string>(["str", "Any"]) }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["UserItem"]) }
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
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "tags", type: new ListSet<string>(["str"]) }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["UserItem"]) }
    });
  });

  test("should return List[Union[Type1, Type2, ...]] for heterogeneous lists inside objects", () => {
    const input = [{ id: 1, values: [1, "text", true] }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            {
              name: "values",
              type: new ListSet<string>(["bool", "int", "str"])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["UserItem"]) }
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
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            {
              name: "matrix",
              type: new ListSet<string>([new ListSet<string>(["int"])])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["UserItem"]) }
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
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            {
              name: "matrix",
              type: new ListSet<string>([
                new ListSet<string>(["bool", "float", "str", "int"])
              ])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["UserItem"]) }
    });
  });

  test("should handle deeply nested structures", () => {
    const input = [
      { id: 1, metadata: { details: { verified: true, level: 5 } } }
    ];

    const { generatedClassModels, newAttribute } = processArray(input, "user");

    expect(serializeClasses(generatedClassModels)).toEqual(
      serializeClasses([
        {
          className: "Details",
          attributes: [
            { name: "verified", type: new TypeSet(["bool"]) },
            { name: "level", type: new TypeSet(["int"]) }
          ]
        },
        {
          className: "Metadata",
          attributes: [{ name: "details", type: new TypeSet(["Details"]) }]
        },
        {
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "metadata", type: new TypeSet(["Metadata"]) }
          ]
        }
      ])
    );
    expect(newAttribute).toEqual({
      name: "user",
      type: new ListSet<string>(["UserItem"])
    });
  });

  test("should handle deeply nested lists of objects", () => {
    const input = [{ id: 1, data: [[{ value: 10 }], [{ value: 20 }]] }];

    const result = processArray(input, "users");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "Datum",
          attributes: [{ name: "value", type: new TypeSet(["int"]) }]
        },
        {
          className: "User",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            {
              name: "data",
              type: new ListSet<string>([new ListSet<string>(["Datum"])])
            }
          ]
        }
      ],
      newAttribute: { name: "users", type: new ListSet<string>(["User"]) }
    });
  });

  test("should handle lists of lists where some inner lists contain objects and others contain primitives", () => {
    const input = [{ id: 1, mixed: [[{ value: 10 }], ["string"]] }];

    const result = processArray(input, "user");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "MixedItem",
          attributes: [{ name: "value", type: new TypeSet(["int"]) }]
        },
        {
          className: "UserItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            {
              name: "mixed",
              type: new ListSet<string>([
                new ListSet<string>(["str", "MixedItem"])
              ])
            }
          ]
        }
      ],
      newAttribute: { name: "user", type: new ListSet<string>(["UserItem"]) }
    });
  });

  test("should handle objects with null attributes", () => {
    const input = [
      {
        id: 1,
        active: null,
        score: 12.5
      },
      {
        id: "02",
        active: null
      }
    ];

    const result = processArray(input, "users");

    expect(result).toEqual({
      generatedClassModels: [
        {
          className: "User",
          attributes: [
            { name: "id", type: new TypeSet<string>(["int", "str"]) },
            { name: "active", type: new TypeSet<string>(["Any"]) },
            { name: "score", type: new TypeSet<string>(["Any", "float"]) }
          ]
        }
      ],
      newAttribute: { name: "users", type: new ListSet<string>(["User"]) }
    });
  });

  test("should handle fromObjectArrayJson correctly (no List class name changes)", () => {
    const arr = [
      { timestamp: "2021-01-01", status: "ok" },
      { timestamp: "2021-01-02", status: "error" }
    ];
    const { generatedClassModels, newAttribute } = processArray(
      arr,
      "logs",
      [],
      true
    );

    expect(generatedClassModels).toHaveLength(1);
    expect(generatedClassModels[0].className).toBe("Logs");
    expect(newAttribute.name).toBe("logs");
    expect([...newAttribute.type]).toEqual(["Logs"]);
    expect(generatedClassModels).toEqual([
      {
        className: "Logs",
        attributes: [
          { name: "timestamp", type: new TypeSet(["str"]) },
          { name: "status", type: new TypeSet(["str"]) }
        ]
      }
    ]);
  });

  test("should generate non-duplicate names when needed", () => {
    const arr = [{ id: 1 }, { id: 2 }];
    const existentClassNames = ["Id"];
    const { generatedClassModels, newAttribute } = processArray(
      arr,
      "ids",
      existentClassNames
    );

    expect(generatedClassModels[0].className).toBe("Id1");
    expect([...newAttribute.type]).toEqual(["Id1"]);
  });
});
