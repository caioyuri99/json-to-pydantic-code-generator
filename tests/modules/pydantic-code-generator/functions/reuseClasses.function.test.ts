import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { ClassModel } from "../../../../src/modules/pydantic-code-generator/types/ClassModel.type";
import { reuseClasses } from "../../../../src/modules/pydantic-code-generator/functions/reuseClasses.function";
import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { ClassAttribute } from "../../../../src/modules/pydantic-code-generator/types/ClassAttribute.type";

describe("reuseClasses", () => {
  test("reuseClasses: matches a class with identical attributes", () => {
    const oldClasses: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "name", type: new TypeSet(["str"]) }
        ]
      }
    ];

    const newClasses: ClassModel[] = [
      {
        className: "User2",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "name", type: new TypeSet(["str"]) }
        ]
      },
      {
        className: "Profile",
        attributes: [{ name: "user", type: new TypeSet(["User2"]) }]
      }
    ];

    reuseClasses(oldClasses, newClasses);

    expect(oldClasses).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "name", type: new TypeSet(["str"]) }
        ]
      },
      {
        className: "Profile",
        attributes: [{ name: "user", type: new TypeSet(["User"]) }]
      }
    ]);
  });

  test("reuseClasses: does not reuse if attributes differ", () => {
    const oldClasses: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "name", type: new TypeSet(["str"]) }
        ]
      }
    ];

    const newClasses: ClassModel[] = [
      {
        className: "User2",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "email", type: new TypeSet(["str"]) }
        ]
      },
      {
        className: "Profile",
        attributes: [{ name: "user", type: new TypeSet(["User2"]) }]
      }
    ];

    reuseClasses(oldClasses, newClasses);

    expect(oldClasses).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "name", type: new TypeSet(["str"]) }
        ]
      },
      {
        className: "User2",
        attributes: [
          { name: "id", type: new TypeSet(["int"]) },
          { name: "email", type: new TypeSet(["str"]) }
        ]
      },
      {
        className: "Profile",
        attributes: [{ name: "user", type: new TypeSet(["User2"]) }]
      }
    ]);
  });

  test("reuseClasses: reuses ListSet references", () => {
    const oldClasses: ClassModel[] = [
      {
        className: "Item",
        attributes: [{ name: "value", type: new TypeSet(["str"]) }]
      }
    ];

    const newClasses: ClassModel[] = [
      {
        className: "Item2",
        attributes: [{ name: "value", type: new TypeSet(["str"]) }]
      },
      {
        className: "Container",
        attributes: [
          {
            name: "items",
            type: new TypeSet([new ListSet<string>().add("Item2")])
          }
        ]
      }
    ];

    reuseClasses(oldClasses, newClasses);

    expect(oldClasses).toEqual([
      {
        className: "Item",
        attributes: [{ name: "value", type: new TypeSet(["str"]) }]
      },
      {
        className: "Container",
        attributes: [
          {
            name: "items",
            type: new TypeSet([new ListSet<string>().add("Item")])
          }
        ]
      }
    ]);
  });

  test("reuseClasses: reuses deeply in multiple new classes", () => {
    const oldClasses: ClassModel[] = [
      {
        className: "Person",
        attributes: [{ name: "name", type: new TypeSet(["str"]) }]
      }
    ];

    const newClasses: ClassModel[] = [
      {
        className: "Person2",
        attributes: [{ name: "name", type: new TypeSet(["str"]) }]
      },
      {
        className: "Group",
        attributes: [
          {
            name: "members",
            type: new TypeSet([new ListSet(["Person2"])])
          }
        ]
      },
      {
        className: "Event",
        attributes: [{ name: "organizer", type: new TypeSet(["Person2"]) }]
      }
    ];

    reuseClasses(oldClasses, newClasses);

    expect(oldClasses).toEqual([
      {
        className: "Person",
        attributes: [{ name: "name", type: new TypeSet(["str"]) }]
      },
      {
        className: "Group",
        attributes: [
          {
            name: "members",
            type: new TypeSet([new ListSet(["Person"])])
          }
        ]
      },
      {
        className: "Event",
        attributes: [{ name: "organizer", type: new TypeSet(["Person"]) }]
      }
    ]);
  });

  test("should update newAttribute.type when class is reused", () => {
    const oldClasses: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet(["number"]) },
          { name: "name", type: new TypeSet(["string"]) }
        ]
      }
    ];

    const newClasses: ClassModel[] = [
      {
        className: "UsersItem",
        attributes: [
          { name: "id", type: new TypeSet(["number"]) },
          { name: "name", type: new TypeSet(["string"]) }
        ]
      }
    ];

    const newAttribute: ClassAttribute = {
      name: "users",
      type: new ListSet(["UsersItem"])
    };

    reuseClasses(oldClasses, newClasses, newAttribute);

    expect([...newAttribute.type][0]).toBe("User");

    expect(newClasses.length).toBe(0);
  });

  test("should not update newAttribute.type when no reusable class exists", () => {
    const oldClasses: ClassModel[] = [
      {
        className: "Account",
        attributes: [
          { name: "id", type: new TypeSet(["number"]) },
          { name: "balance", type: new TypeSet(["number"]) }
        ]
      }
    ];

    const newClasses: ClassModel[] = [
      {
        className: "UsersItem",
        attributes: [
          { name: "id", type: new TypeSet(["number"]) },
          { name: "name", type: new TypeSet(["string"]) }
        ]
      }
    ];

    const newAttribute: ClassAttribute = {
      name: "users",
      type: new ListSet(["UsersItem"])
    };

    reuseClasses(oldClasses, newClasses, newAttribute);

    expect([...newAttribute.type][0]).toBe("UsersItem");

    expect(oldClasses.some((c) => c.className === "UsersItem")).toBe(true);
  });

  test("should work correctly when newAttribute is not provided", () => {
    const oldClasses: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: new TypeSet(["number"]) },
          { name: "name", type: new TypeSet(["string"]) }
        ]
      }
    ];

    const newClasses: ClassModel[] = [
      {
        className: "UsersItem",
        attributes: [
          { name: "id", type: new TypeSet(["number"]) },
          { name: "name", type: new TypeSet(["string"]) }
        ]
      }
    ];

    reuseClasses(oldClasses, newClasses);

    expect(newClasses.length).toBe(0);
  });
});
