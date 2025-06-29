import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { setOptional } from "../../../../src/modules/pydantic-code-generator/functions/setOptional.function";
import { ClassModel } from "../../../../src/modules/pydantic-code-generator/types/ClassModel.type";

describe("setOptional", () => {
  test("Should add Any to attributes that are not in all matching class models", () => {
    const classes: ClassModel[] = [
      {
        className: "User",

        attributes: [
          { name: "id", type: new TypeSet<string>(["int"]) },
          { name: "name", type: new TypeSet<string>(["str"]) }
        ]
      },
      {
        className: "User",

        attributes: [
          { name: "id", type: new TypeSet<string>(["int"]) },
          { name: "email", type: new TypeSet<string>(["str"]) }
        ]
      },
      {
        className: "Admin", // Classe diferente, deve ser ignorada

        attributes: [
          { name: "id", type: new TypeSet<string>(["int"]) },
          { name: "permissions", type: new TypeSet<string>(["str"]) }
        ]
      }
    ];

    const classModel: ClassModel = {
      className: "User",

      attributes: [
        { name: "id", type: new TypeSet<string>(["int"]) },
        { name: "name", type: new TypeSet<string>(["str"]) },
        { name: "email", type: new TypeSet<string>(["str"]) }
      ]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "id", type: new TypeSet<string>(["int"]) },
      { name: "name", type: new TypeSet<string>(["str", "Any"]) },
      { name: "email", type: new TypeSet<string>(["str", "Any"]) }
    ]);

    // Verifica que as classes originais não foram alteradas
    expect(classes[0].attributes).toEqual([
      { name: "id", type: new TypeSet<string>(["int"]) },
      { name: "name", type: new TypeSet<string>(["str"]) }
    ]);
    expect(classes[1].attributes).toEqual([
      { name: "id", type: new TypeSet<string>(["int"]) },
      { name: "email", type: new TypeSet<string>(["str"]) }
    ]);
    expect(classes[2].attributes).toEqual([
      { name: "id", type: new TypeSet<string>(["int"]) },
      { name: "permissions", type: new TypeSet<string>(["str"]) }
    ]);
  });

  test("Should not modify attributes that are present in all matching class models", () => {
    const classes: ClassModel[] = [
      {
        className: "User",

        attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
      },
      {
        className: "User",

        attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
      },
      {
        className: "Product", // Deve ser ignorada

        attributes: [{ name: "price", type: new TypeSet<string>(["float"]) }]
      }
    ];

    const classModel: ClassModel = {
      className: "User",

      attributes: [{ name: "id", type: new TypeSet<string>(["int"]) }]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "id", type: new TypeSet<string>(["int"]) }
    ]);
  });

  test("Should not modify classModel if no matching classes are found", () => {
    const classes: ClassModel[] = [
      {
        className: "Order",

        attributes: [{ name: "total", type: new TypeSet<string>(["float"]) }]
      },
      {
        className: "Customer",

        attributes: [{ name: "name", type: new TypeSet<string>(["str"]) }]
      }
    ];

    const classModel: ClassModel = {
      className: "User",

      attributes: [{ name: "username", type: new TypeSet<string>(["str"]) }]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "username", type: new TypeSet<string>(["str"]) }
    ]);
  });

  test("Should correctly handle attributes with existing Set<string> types", () => {
    const classes: ClassModel[] = [
      {
        className: "Product",

        attributes: [
          { name: "price", type: new TypeSet<string>(["float", "int"]) },
          { name: "stock", type: new TypeSet<string>(["int"]) }
        ]
      },
      {
        className: "Product",

        attributes: [
          { name: "price", type: new TypeSet<string>(["float", "int"]) }
        ]
      },
      {
        className: "Order", // Deve ser ignorado

        attributes: [{ name: "status", type: new TypeSet<string>(["str"]) }]
      }
    ];

    const classModel: ClassModel = {
      className: "Product",

      attributes: [
        { name: "price", type: new TypeSet<string>(["float", "int"]) },
        { name: "stock", type: new TypeSet<string>(["int"]) }
      ]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "price", type: new TypeSet<string>(["float", "int"]) },
      { name: "stock", type: new TypeSet<string>(["int", "Any"]) }
    ]);
  });

  test("Should not add Any if classModel already contains Any", () => {
    const classes: ClassModel[] = [
      {
        className: "Device",

        attributes: [{ name: "version", type: new TypeSet<string>(["int"]) }]
      },
      {
        className: "Device",

        attributes: [{ name: "model", type: new TypeSet<string>(["str"]) }]
      },
      {
        className: "User", // Deve ser ignorada

        attributes: [{ name: "username", type: new TypeSet<string>(["str"]) }]
      }
    ];

    const classModel: ClassModel = {
      className: "Device",

      attributes: [
        { name: "version", type: new TypeSet<string>(["int", "Any"]) }
      ]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "version", type: new TypeSet<string>(["int", "Any"]) }
    ]);
  });

  test("Should correctly handle multiple attributes with missing values", () => {
    const classes: ClassModel[] = [
      {
        className: "Employee",

        attributes: [
          { name: "name", type: new TypeSet<string>(["str"]) },
          { name: "salary", type: new TypeSet<string>(["float"]) }
        ]
      },
      {
        className: "Employee",

        attributes: [{ name: "name", type: new TypeSet<string>(["str"]) }]
      },
      {
        className: "Employee",

        attributes: [
          { name: "name", type: new TypeSet<string>(["str"]) },
          { name: "bonus", type: new TypeSet<string>(["int"]) }
        ]
      },
      {
        className: "Manager", // Deve ser ignorada

        attributes: [
          { name: "department", type: new TypeSet<string>(["str"]) },
          { name: "budget", type: new TypeSet<string>(["float"]) }
        ]
      }
    ];

    const classModel: ClassModel = {
      className: "Employee",

      attributes: [
        { name: "name", type: new TypeSet<string>(["str"]) },
        { name: "salary", type: new TypeSet<string>(["float"]) },
        { name: "bonus", type: new TypeSet<string>(["int"]) }
      ]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "name", type: new TypeSet<string>(["str"]) },
      { name: "salary", type: new TypeSet<string>(["float", "Any"]) },
      { name: "bonus", type: new TypeSet<string>(["int", "Any"]) }
    ]);
  });

  test("should add 'Any' to attributes not present in all classes (TypeSet case)", () => {
    const classes: ClassModel[] = [
      {
        className: "Example",

        attributes: [{ name: "a", type: new TypeSet(["int"]) }]
      },
      {
        className: "Example",

        attributes: [{ name: "b", type: new TypeSet(["str"]) }]
      }
    ];

    const classModel: ClassModel = {
      className: "Example",

      attributes: [
        { name: "a", type: new TypeSet(["int"]) },
        { name: "b", type: new TypeSet(["str"]) }
      ]
    };

    setOptional(classes, classModel);

    expect(classModel).toEqual({
      className: "Example",

      attributes: [
        { name: "a", type: new TypeSet(["int", "Any"]) },
        { name: "b", type: new TypeSet(["str", "Any"]) }
      ]
    });
  });

  test("should add 'Any' to attributes not present in all classes (ListSet case)", () => {
    const classes: ClassModel[] = [
      {
        className: "Test",

        attributes: [
          { name: "items", type: new ListSet(["str"]) },
          { name: "price", type: new TypeSet(["int"]) }
        ]
      },
      {
        className: "Test",

        attributes: [{ name: "price", type: new TypeSet(["int"]) }]
      }
    ];

    const classModel: ClassModel = {
      className: "Test",

      attributes: [{ name: "items", type: new ListSet(["str"]) }]
    };

    setOptional(classes, classModel);

    expect(classModel).toEqual({
      className: "Test",

      attributes: [
        {
          name: "items",
          type: new TypeSet([new ListSet(["str"]), "Any"])
        }
      ]
    });
  });

  test("should add 'Any' to TypeSet if attribute is missing in one class (same fromArray)", () => {
    const classes = [
      {
        className: "User",

        attributes: [{ name: "id", type: new TypeSet(["int"]) }]
      },
      {
        className: "User",

        attributes: [{ name: "name", type: new TypeSet(["str"]) }]
      }
    ];

    const merged = {
      className: "User",

      attributes: [
        { name: "id", type: new TypeSet(["int"]) },
        { name: "name", type: new TypeSet(["str"]) }
      ]
    };

    setOptional(classes, merged);

    expect(merged).toEqual({
      className: "User",

      attributes: [
        { name: "id", type: new TypeSet(["int", "Any"]) },
        { name: "name", type: new TypeSet(["str", "Any"]) }
      ]
    });
  });

  test("should NOT add 'Any' for classes with different fromArray", () => {
    const classes = [
      {
        className: "Data",

        attributes: [{ name: "value", type: new TypeSet(["int"]) }]
      }
    ];

    const merged = {
      className: "Data",

      attributes: [
        { name: "value", type: new TypeSet(["int"]) },
        { name: "extra", type: new TypeSet(["str"]) }
      ]
    };

    setOptional(classes, merged);

    // Nada deve ser modificado, pois fromArray não é compatível
    expect(merged).toEqual({
      className: "Data",

      attributes: [
        { name: "value", type: new TypeSet(["int"]) },
        { name: "extra", type: new TypeSet(["str"]) }
      ]
    });
  });

  test("should leave attribute unchanged if it's present in all classes", () => {
    const classes = [
      {
        className: "Log",

        attributes: [{ name: "message", type: new TypeSet(["str"]) }]
      },
      {
        className: "Log",

        attributes: [{ name: "message", type: new TypeSet(["str"]) }]
      }
    ];

    const merged = {
      className: "Log",

      attributes: [{ name: "message", type: new TypeSet(["str"]) }]
    };

    setOptional(classes, merged);

    expect(merged).toEqual({
      className: "Log",

      attributes: [{ name: "message", type: new TypeSet(["str"]) }]
    });
  });
});
