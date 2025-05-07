import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { generateClasses } from "../../../../src/modules/pydantic-code-generator/functions/generateClasses.function";
import { serializeClasses } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

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

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "Person",
          attributes: [
            { name: "id", type: new TypeSet(["int"]), alias: "" },
            { name: "name", type: new TypeSet(["str"]), alias: "" },
            { name: "age", type: new TypeSet(["int"]), alias: "" }
          ]
        }
      ])
    );
  });

  test("should generate nested classes for an object with nested objects", () => {
    const json = {
      user: { id: 1, profile: { bio: "Hello", website: "example.com" } }
    };

    const result = generateClasses(json, "Root");

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "Profile",
          attributes: [
            { name: "bio", type: new TypeSet(["str"]), alias: "" },
            { name: "website", type: new TypeSet(["str"]), alias: "" }
          ]
        },
        {
          className: "User",
          attributes: [
            { name: "id", type: new TypeSet(["int"]), alias: "" },
            { name: "profile", type: new TypeSet(["Profile"]), alias: "" }
          ]
        },
        {
          className: "Root",
          attributes: [{ name: "user", type: new TypeSet(["User"]), alias: "" }]
        }
      ])
    );
  });

  test("should generate a list of objects as a separate class", () => {
    const json = {
      users: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" }
      ]
    };

    const result = generateClasses(json, "Root");

    console.dir(serializeClasses(result), { depth: null });

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "UsersItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]), alias: "" },
            { name: "name", type: new TypeSet(["str"]), alias: "" }
          ]
        },
        {
          className: "Root",
          attributes: [
            {
              name: "users",
              type: new ListSet<string>(["UsersItem"]),
              alias: ""
            }
          ]
        }
      ])
    );
  });

  test("should generate types with Any for missing attributes in some objects", () => {
    const json = {
      items: [{ id: 1, value: "A" }, { id: 2 }]
    };

    const result = generateClasses(json, "Root");

    expect(result).toEqual([
      {
        className: "ItemsItem",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "value", type: new TypeSet<string>(["str", "Any"]) }
        ]
      },
      {
        className: "Root",
        attributes: [
          { name: "items", type: new ListSet<string>(["ItemsItem"]) }
        ]
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
        attributes: [
          {
            name: "matrix",
            type: new ListSet<string>([new ListSet<string>(["int"])])
          }
        ]
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
        className: "DataItem",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "name", type: new TypeSet(["str"]) }
        ]
      },
      {
        className: "Root",
        attributes: [
          {
            name: "data",
            type: new ListSet<string>([new ListSet<string>(["DataItem"])])
          }
        ]
      }
    ]);
  });

  test("should handle duplicated class names", () => {
    const json = {
      user: {
        profile: {
          info: { age: 30, name: "Alice" }
        },
        backup: {
          info: { email: "a@b.com" }
        }
      }
    };

    const result = generateClasses(json);

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "Info",
          attributes: [
            { name: "age", type: new TypeSet<string>(["int"]) },
            { name: "name", type: new TypeSet<string>(["str"]) }
          ]
        },
        {
          className: "Profile",
          attributes: [{ name: "info", type: new TypeSet<string>(["Info"]) }]
        },
        {
          className: "Info1",
          attributes: [{ name: "email", type: new TypeSet<string>(["str"]) }]
        },
        {
          className: "Backup",
          attributes: [{ name: "info", type: new TypeSet(["Info1"]) }]
        },
        {
          className: "User",
          attributes: [
            { name: "profile", type: new TypeSet<string>(["Profile"]) },
            { name: "backup", type: new TypeSet<string>(["Backup"]) }
          ]
        },
        {
          className: "Model",
          attributes: [
            {
              name: "user",
              type: new TypeSet<string>(["User"])
            }
          ]
        }
      ])
    );
  });

  test("should handle objects with missing attributes and mixed types", () => {
    const json = {
      users: [
        {
          id: 1,
          active: true,
          score: 12.5
        },
        {
          id: "02",
          active: null
        }
      ]
    };

    const result = generateClasses(json);

    expect(result).toEqual([
      {
        className: "UsersItem",
        attributes: [
          { name: "id", type: new TypeSet<string>(["int", "str"]) },
          { name: "active", type: new TypeSet<string>(["Any", "bool"]) },
          { name: "score", type: new TypeSet<string>(["Any", "float"]) }
        ]
      },
      {
        className: "Model",
        attributes: [
          { name: "users", type: new ListSet<string>(["UsersItem"]) }
        ]
      }
    ]);
  });

  test("should handle list of lists", () => {
    const json = {
      matrix: [
        [
          [1, 2],
          [3, 4]
        ],
        [[5, 6]]
      ]
    };

    const result = generateClasses(json);

    expect(result).toEqual([
      {
        className: "Model",
        attributes: [
          {
            name: "matrix",
            type: new ListSet<string>([
              new ListSet<string>([new ListSet<string>(["int"])])
            ])
          }
        ]
      }
    ]);
  });

  test("should handle heterogeneus list of objects", () => {
    const json = {
      items: [
        { name: "item1", price: 10 },
        { name: "item2", discount: true },
        { tags: ["sale", "popular"] }
      ]
    };

    const result = generateClasses(json);

    console.log(result[0]);

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "ItemsItem",
          attributes: [
            { name: "name", type: new TypeSet<string>(["Any", "str"]) },
            { name: "price", type: new TypeSet<string>(["Any", "int"]) },
            { name: "discount", type: new TypeSet<string>(["Any", "bool"]) },
            {
              name: "tags",
              type: new TypeSet<string>(["Any", new ListSet<string>(["str"])])
            }
          ]
        },
        {
          className: "Model",
          attributes: [
            { name: "items", type: new ListSet<string>(["ItemsItem"]) }
          ]
        }
      ])
    );
  });

  test("should handle high depth + duplicated names", () => {
    const json = {
      level: {
        level: {
          data: {
            value: 1
          }
        },
        mirror: {
          data: {
            value: "one"
          }
        }
      }
    };

    const result = generateClasses(json);

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "Data",
          attributes: [{ name: "value", type: new TypeSet(["int"]) }]
        },
        {
          className: "Level1",
          attributes: [{ name: "data", type: new TypeSet(["Data"]) }]
        },
        {
          className: "Data1",
          attributes: [{ name: "value", type: new TypeSet(["str"]) }]
        },
        {
          className: "Mirror",
          attributes: [{ name: "data", type: new TypeSet(["Data1"]) }]
        },
        {
          className: "Level",
          attributes: [
            { name: "level", type: new TypeSet(["Level1"]) },
            { name: "mirror", type: new TypeSet(["Mirror"]) }
          ]
        },
        {
          className: "Model",
          attributes: [{ name: "level", type: new TypeSet(["Level"]) }]
        }
      ])
    );
  });

  test("should not rename if there are no conflicting class names", () => {
    const json = {
      user: {
        name: "Alice"
      },
      address: {
        city: "Paris"
      }
    };

    const result = generateClasses(json);

    expect(result).toEqual([
      {
        className: "User",
        attributes: [{ name: "name", type: new TypeSet(["str"]) }]
      },
      {
        className: "Address",
        attributes: [{ name: "city", type: new TypeSet(["str"]) }]
      },
      {
        className: "Model",
        attributes: [
          { name: "user", type: new TypeSet<string>(["User"]) },
          { name: "address", type: new TypeSet<string>(["Address"]) }
        ]
      }
    ]);
  });

  test("should rename classes with the same name", () => {
    const json = {
      item: { name: "book" },
      cart: { item: { price: 9.99 } }
    };

    const result = generateClasses(json);

    expect(result).toEqual([
      {
        className: "Item",
        attributes: [{ name: "name", type: new TypeSet(["str"]) }]
      },
      {
        className: "Item1",
        attributes: [{ name: "price", type: new TypeSet(["float"]) }]
      },
      {
        className: "Cart",
        attributes: [{ name: "item", type: new TypeSet(["Item1"]) }]
      },
      {
        className: "Model",
        attributes: [
          { name: "item", type: new TypeSet(["Item"]) },
          { name: "cart", type: new TypeSet(["Cart"]) }
        ]
      }
    ]);
  });

  test("should rename multiple classes with the same name", () => {
    const json = {
      item: { id: 1 },
      data: { item: { id: "a" } },
      more: { item: { id: true } }
    };

    const result = generateClasses(json);

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "Item",
          attributes: [{ name: "id", type: new TypeSet(["int"]) }]
        },
        {
          className: "Item1",
          attributes: [{ name: "id", type: new TypeSet(["str"]) }]
        },
        {
          className: "Data",
          attributes: [{ name: "item", type: new TypeSet(["Item1"]) }]
        },
        {
          className: "Item2",
          attributes: [{ name: "id", type: new TypeSet(["bool"]) }]
        },
        {
          className: "More",
          attributes: [{ name: "item", type: new TypeSet(["Item2"]) }]
        },
        {
          className: "Model",
          attributes: [
            { name: "item", type: new TypeSet(["Item"]) },
            { name: "data", type: new TypeSet(["Data"]) },
            { name: "more", type: new TypeSet(["More"]) }
          ]
        }
      ])
    );
  });

  test("should rename class used inside a ListSet", () => {
    const json = {
      products: [{ name: "Book" }],
      backup: { products: [{ price: 10 }] }
    };

    const result = generateClasses(json);

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "ProductsItem",
          attributes: [{ name: "name", type: new TypeSet(["str"]) }]
        },
        {
          className: "ProductsItem1",
          attributes: [{ name: "price", type: new TypeSet(["int"]) }]
        },
        {
          className: "Backup",
          attributes: [
            { name: "products", type: new ListSet(["ProductsItem1"]) }
          ]
        },
        {
          className: "Model",
          attributes: [
            { name: "products", type: new ListSet(["ProductsItem"]) },
            { name: "backup", type: new TypeSet(["Backup"]) }
          ]
        }
      ])
    );
  });

  test("complex json example", () => {
    const json = {
      id: 1,
      name: "Main Entity",
      details: {
        id: 100,
        info: {
          id: 200,
          name: "Info Name",
          attributes: [
            {
              id: 300,
              name: "Attribute 1",
              value: "Some value"
            },
            {
              id: 301,
              name: "Attribute 2",
              tags: ["tag1", "tag2"]
            }
          ]
        },
        history: [
          {
            id: 400,
            date: "2023-01-01",
            changes: [
              {
                id: 401,
                field: "name",
                old_value: "Old Name",
                new_value: "New Name"
              },
              {
                id: 402,
                field: "status",
                old_value: "inactive",
                new_value: "active"
              }
            ]
          },
          {
            id: 403,
            date: "2023-01-15",
            changes: []
          }
        ]
      },
      items: [
        {
          id: 500,
          name: "Item A",
          details: {
            id: 501,
            name: "Detail A",
            value: 42
          }
        },
        {
          id: 502,
          name: "Item B",
          details: {
            id: 503,
            description: "Detail B"
          }
        }
      ]
    };

    const result = generateClasses(json);

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "AttributesItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "name", type: new TypeSet(["str"]) },
            { name: "value", type: new TypeSet(["Any", "str"]) },
            { name: "tags", type: new TypeSet(["Any", new ListSet(["str"])]) }
          ]
        },
        {
          className: "Info",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "name", type: new TypeSet(["str"]) },
            { name: "attributes", type: new ListSet(["AttributesItem"]) }
          ]
        },
        {
          className: "ChangesItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "field", type: new TypeSet(["str"]) },
            { name: "old_value", type: new TypeSet(["str"]) },
            { name: "new_value", type: new TypeSet(["str"]) }
          ]
        },
        {
          className: "HistoryItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "date", type: new TypeSet(["str"]) },
            { name: "changes", type: new ListSet(["ChangesItem"]) }
          ]
        },
        {
          className: "Details",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "info", type: new TypeSet(["Info"]) },
            { name: "history", type: new ListSet(["HistoryItem"]) }
          ]
        },
        {
          className: "Details1",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "name", type: new TypeSet(["Any", "str"]) },
            { name: "value", type: new TypeSet(["Any", "int"]) },
            { name: "description", type: new TypeSet(["Any", "str"]) }
          ]
        },
        {
          className: "ItemsItem",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "name", type: new TypeSet(["str"]) },
            { name: "details", type: new TypeSet(["Details1"]) }
          ]
        },
        {
          className: "Model",
          attributes: [
            { name: "id", type: new TypeSet(["int"]) },
            { name: "name", type: new TypeSet(["str"]) },
            { name: "details", type: new TypeSet(["Details"]) },
            { name: "items", type: new ListSet(["ItemsItem"]) }
          ]
        }
      ])
    );
  });

  test("complex json duplicated names", () => {
    const json = {
      profile: {
        info: {
          age: 30,
          location: "USA"
        },
        history: [
          {
            info: {
              year: 2020,
              location: "Canada"
            }
          },
          {
            info: {
              year: 2021,
              location: "Mexico"
            }
          }
        ]
      },
      settings: {
        preferences: {
          notifications: true,
          theme: "dark"
        },
        info: {
          version: "1.0.0",
          updated: "2024-05-01"
        }
      },
      logs: [
        {
          info: {
            timestamp: "2024-01-01T10:00:00Z",
            status: "ok"
          },
          data: {
            type: "metric",
            value: 42
          }
        },
        {
          info: {
            timestamp: "2024-01-02T12:30:00Z",
            status: "warning"
          },
          data: [
            {
              type: "event",
              severity: "high"
            },
            {
              type: "event",
              severity: "low"
            }
          ]
        }
      ]
    };

    const result = generateClasses(json);

    console.dir(serializeClasses(result), { depth: null });

    expect(serializeClasses(result)).toEqual(
      serializeClasses([
        {
          className: "Info",
          attributes: [
            { name: "age", type: new TypeSet(["int"]) },
            { name: "location", type: new TypeSet(["str"]) }
          ]
        },
        {
          className: "Info1",
          attributes: [
            { name: "year", type: new TypeSet(["int"]) },
            { name: "location", type: new TypeSet(["str"]) }
          ]
        },
        {
          className: "HistoryItem",
          attributes: [{ name: "info", type: new TypeSet(["Info1"]) }]
        },
        {
          className: "Profile",
          attributes: [
            { name: "info", type: new TypeSet(["Info"]) },
            { name: "history", type: new ListSet(["HistoryItem"]) }
          ]
        },
        {
          className: "Preferences",
          attributes: [
            { name: "notifications", type: new TypeSet(["bool"]) },
            { name: "theme", type: new TypeSet(["str"]) }
          ]
        },
        {
          className: "Info2",
          attributes: [
            { name: "version", type: new TypeSet(["str"]) },
            { name: "updated", type: new TypeSet(["str"]) }
          ]
        },
        {
          className: "Settings",
          attributes: [
            { name: "preferences", type: new TypeSet(["Preferences"]) },
            { name: "info", type: new TypeSet(["Info2"]) }
          ]
        },
        {
          className: "Info3",
          attributes: [
            { name: "timestamp", type: new TypeSet(["str"]) },
            { name: "status", type: new TypeSet(["str"]) }
          ]
        },
        {
          className: "Data",
          attributes: [
            { name: "type", type: new TypeSet(["str"]) },
            { name: "value", type: new TypeSet(["int"]) }
          ]
        },
        {
          className: "DataItem",
          attributes: [
            { name: "type", type: new TypeSet(["str"]) },
            { name: "severity", type: new TypeSet(["str"]) }
          ]
        },
        {
          className: "LogsItem",
          attributes: [
            { name: "info", type: new TypeSet(["Info3"]) },
            {
              name: "data",
              type: new TypeSet(["Data", new ListSet(["DataItem"])])
            }
          ]
        },
        {
          className: "Model",
          attributes: [
            { name: "profile", type: new TypeSet(["Profile"]) },
            { name: "settings", type: new TypeSet(["Settings"]) },
            { name: "logs", type: new ListSet(["LogsItem"]) }
          ]
        }
      ])
    );
  });
});
