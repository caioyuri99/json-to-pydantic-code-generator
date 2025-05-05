import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { serializeClasses } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("serializeClasses", () => {
  test("serialize a single class with primitive types", () => {
    const classes = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "name", type: new TypeSet(["str"]) }
        ]
      }
    ];

    expect(serializeClasses(classes)).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "name", type: "str" }
        ]
      }
    ]);
  });

  test("serialize a class with a reference to another class", () => {
    const classes = [
      {
        className: "Address",
        attributes: [
          { name: "city", type: new TypeSet(["str"]) },
          { name: "zip", type: new TypeSet(["str"]) }
        ]
      },
      {
        className: "User",
        attributes: [
          { name: "name", type: new TypeSet(["str"]) },
          { name: "address", type: new TypeSet(["Address"]) }
        ]
      }
    ];

    expect(serializeClasses(classes)).toEqual([
      {
        className: "Address",
        attributes: [
          { name: "city", type: "str" },
          { name: "zip", type: "str" }
        ]
      },
      {
        className: "User",
        attributes: [
          { name: "name", type: "str" },
          { name: "address", type: "Address" }
        ]
      }
    ]);
  });

  test("serialize a class with a ListSet type", () => {
    const classes = [
      {
        className: "Item",
        attributes: [
          { name: "name", type: new TypeSet(["str"]) },
          { name: "quantity", type: new TypeSet(["int"]) }
        ]
      },
      {
        className: "Cart",
        attributes: [
          {
            name: "items",
            type: new ListSet(["Item"])
          }
        ]
      }
    ];

    expect(serializeClasses(classes)).toEqual([
      {
        className: "Item",
        attributes: [
          { name: "name", type: "str" },
          { name: "quantity", type: "int" }
        ]
      },
      {
        className: "Cart",
        attributes: [{ name: "items", type: "List[Item]" }]
      }
    ]);
  });

  test("serialize a class with Union and List types", () => {
    const classes = [
      {
        className: "Data",
        attributes: [
          { name: "type", type: new TypeSet(["str"]) },
          { name: "value", type: new TypeSet(["int"]) }
        ]
      },
      {
        className: "Entry",
        attributes: [
          {
            name: "data",
            type: new TypeSet(["Data", new ListSet(["Data"])])
          }
        ]
      }
    ];

    expect(serializeClasses(classes)).toEqual([
      {
        className: "Data",
        attributes: [
          { name: "type", type: "str" },
          { name: "value", type: "int" }
        ]
      },
      {
        className: "Entry",
        attributes: [{ name: "data", type: "Union[Data, List[Data]]" }]
      }
    ]);
  });

  test("serialize a class with an Any type", () => {
    const classes = [
      {
        className: "Event",
        attributes: [{ name: "metadata", type: new TypeSet(["Any"]) }]
      }
    ];

    expect(serializeClasses(classes)).toEqual([
      {
        className: "Event",
        attributes: [{ name: "metadata", type: "Any" }]
      }
    ]);
  });

  test("serialize a class with Union of primitive and Any", () => {
    const classes = [
      {
        className: "Log",
        attributes: [{ name: "message", type: new TypeSet(["str", "Any"]) }]
      }
    ];

    expect(serializeClasses(classes)).toEqual([
      {
        className: "Log",
        attributes: [{ name: "message", type: "Optional[str]" }]
      }
    ]);
  });

  test("serialize a class with Union of List and Any", () => {
    const classes = [
      {
        className: "Result",
        attributes: [
          {
            name: "errors",
            type: new TypeSet([new ListSet(["str"]), "Any"])
          }
        ]
      }
    ];

    expect(serializeClasses(classes)).toEqual([
      {
        className: "Result",
        attributes: [{ name: "errors", type: "Optional[List[str]]" }]
      }
    ]);
  });

  test("serialize a class with multiple levels of Union and Any", () => {
    const classes = [
      {
        className: "Config",
        attributes: [
          {
            name: "settings",
            type: new TypeSet([new ListSet(["str", "int"]), "Any"])
          }
        ]
      }
    ];

    expect(serializeClasses(classes)).toEqual([
      {
        className: "Config",
        attributes: [
          { name: "settings", type: "Optional[List[Union[int, str]]]" }
        ]
      }
    ]);
  });
});
