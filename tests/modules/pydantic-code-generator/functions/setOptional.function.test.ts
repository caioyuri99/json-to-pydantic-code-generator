import { setOptional } from "../../../../src/modules/pydantic-code-generator/functions/setOptional.function";
import { ClassModel } from "../../../../src/modules/pydantic-code-generator/types/ClassModel.type";

describe("setOptional", () => {
  test("Should add Any to attributes that are not in all matching class models", () => {
    const classes: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "name", type: "str" }
        ]
      },
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "email", type: "str" }
        ]
      },
      {
        className: "Admin", // Classe diferente, deve ser ignorada
        attributes: [
          { name: "id", type: "int" },
          { name: "permissions", type: "str" }
        ]
      }
    ];

    const classModel: ClassModel = {
      className: "User",
      attributes: [
        { name: "id", type: "int" },
        { name: "name", type: "str" },
        { name: "email", type: "str" }
      ]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "id", type: "int" },
      { name: "name", type: new Set(["str", "Any"]) },
      { name: "email", type: new Set(["str", "Any"]) }
    ]);

    // Verifica que as classes originais não foram alteradas
    expect(classes[0].attributes).toEqual([
      { name: "id", type: "int" },
      { name: "name", type: "str" }
    ]);
    expect(classes[1].attributes).toEqual([
      { name: "id", type: "int" },
      { name: "email", type: "str" }
    ]);
    expect(classes[2].attributes).toEqual([
      { name: "id", type: "int" },
      { name: "permissions", type: "str" }
    ]);
  });

  test("Should not modify attributes that are present in all matching class models", () => {
    const classes: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: "int" }]
      },
      {
        className: "User",
        attributes: [{ name: "id", type: "int" }]
      },
      {
        className: "Product", // Deve ser ignorada
        attributes: [{ name: "price", type: "float" }]
      }
    ];

    const classModel: ClassModel = {
      className: "User",
      attributes: [{ name: "id", type: "int" }]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([{ name: "id", type: "int" }]);
  });

  test("Should not modify classModel if no matching classes are found", () => {
    const classes: ClassModel[] = [
      {
        className: "Order",
        attributes: [{ name: "total", type: "float" }]
      },
      {
        className: "Customer",
        attributes: [{ name: "name", type: "str" }]
      }
    ];

    const classModel: ClassModel = {
      className: "User",
      attributes: [{ name: "username", type: "str" }]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([{ name: "username", type: "str" }]);
  });

  test("Should correctly handle attributes with existing Set<string> types", () => {
    const classes: ClassModel[] = [
      {
        className: "Product",
        attributes: [
          { name: "price", type: new Set(["float", "int"]) },
          { name: "stock", type: "int" }
        ]
      },
      {
        className: "Product",
        attributes: [{ name: "price", type: new Set(["float", "int"]) }]
      },
      {
        className: "Order", // Deve ser ignorado
        attributes: [{ name: "status", type: "str" }]
      }
    ];

    const classModel: ClassModel = {
      className: "Product",
      attributes: [
        { name: "price", type: new Set(["float", "int"]) },
        { name: "stock", type: "int" }
      ]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "price", type: new Set(["float", "int"]) },
      { name: "stock", type: new Set(["int", "Any"]) }
    ]);
  });

  test("Should not add Any if classModel already contains Any", () => {
    const classes: ClassModel[] = [
      {
        className: "Device",
        attributes: [{ name: "version", type: "int" }]
      },
      {
        className: "Device",
        attributes: [{ name: "model", type: "str" }]
      },
      {
        className: "User", // Deve ser ignorada
        attributes: [{ name: "username", type: "str" }]
      }
    ];

    const classModel: ClassModel = {
      className: "Device",
      attributes: [{ name: "version", type: new Set(["int", "Any"]) }]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "version", type: new Set(["int", "Any"]) }
    ]);
  });

  test("Should correctly handle multiple attributes with missing values", () => {
    const classes: ClassModel[] = [
      {
        className: "Employee",
        attributes: [
          { name: "name", type: "str" },
          { name: "salary", type: "float" }
        ]
      },
      {
        className: "Employee",
        attributes: [{ name: "name", type: "str" }]
      },
      {
        className: "Employee",
        attributes: [
          { name: "name", type: "str" },
          { name: "bonus", type: "int" }
        ]
      },
      {
        className: "Manager", // Deve ser ignorada
        attributes: [
          { name: "department", type: "str" },
          { name: "budget", type: "float" }
        ]
      }
    ];

    const classModel: ClassModel = {
      className: "Employee",
      attributes: [
        { name: "name", type: "str" },
        { name: "salary", type: "float" },
        { name: "bonus", type: "int" }
      ]
    };

    setOptional(classes, classModel);

    expect(classModel.attributes).toEqual([
      { name: "name", type: "str" },
      { name: "salary", type: new Set(["float", "Any"]) },
      { name: "bonus", type: new Set(["int", "Any"]) }
    ]);
  });
});
