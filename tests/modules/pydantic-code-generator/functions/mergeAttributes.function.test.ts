import { mergeAttributes } from "../../../../src/modules/pydantic-code-generator/functions/mergeAttributes.function";
import { ClassModel } from "../../../../src/modules/pydantic-code-generator/types/ClassModel.type";

describe("mergeAttributes", () => {
  test("Should add unique attributes from classModel to existingClass", () => {
    const existingClass: ClassModel = {
      className: "Person",
      attributes: [{ name: "name", type: "str" }]
    };

    const classModel: ClassModel = {
      className: "Person",
      attributes: [{ name: "age", type: "int" }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "name", type: "str" },
      { name: "age", type: "int" }
    ]);
  });

  test("Should merge types when both attributes are strings", () => {
    const existingClass: ClassModel = {
      className: "Person",
      attributes: [{ name: "name", type: "str" }]
    };

    const classModel: ClassModel = {
      className: "Person",
      attributes: [{ name: "name", type: "int" }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "name", type: new Set(["str", "int"]) }
    ]);
  });

  test("Should merge multiple attributes correctly", () => {
    const existingClass: ClassModel = {
      className: "Employee",
      attributes: [
        { name: "id", type: "int" },
        { name: "salary", type: "float" }
      ]
    };

    const classModel: ClassModel = {
      className: "Employee",
      attributes: [
        { name: "id", type: "str" },
        { name: "department", type: "str" }
      ]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "id", type: new Set(["int", "str"]) },
      { name: "salary", type: "float" },
      { name: "department", type: "str" }
    ]);
  });

  test("Should not modify existingClass if classModel has no new attributes", () => {
    const existingClass: ClassModel = {
      className: "Car",
      attributes: [{ name: "brand", type: "str" }]
    };

    const classModel: ClassModel = {
      className: "Car",
      attributes: []
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([{ name: "brand", type: "str" }]);
  });

  test("Should correctly merge when attributes have Set<string> as type", () => {
    const existingClass: ClassModel = {
      className: "Product",
      attributes: [
        { name: "price", type: new Set(["float"]) },
        { name: "stock", type: new Set(["int"]) }
      ]
    };

    const classModel: ClassModel = {
      className: "Product",
      attributes: [
        { name: "price", type: new Set(["int"]) },
        { name: "stock", type: new Set(["str"]) }
      ]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "price", type: new Set(["float", "int"]) },
      { name: "stock", type: new Set(["int", "str"]) }
    ]);
  });

  test("Should handle merging a string type into an existing Set<string>", () => {
    const existingClass: ClassModel = {
      className: "Device",
      attributes: [{ name: "version", type: new Set(["float"]) }]
    };

    const classModel: ClassModel = {
      className: "Device",
      attributes: [{ name: "version", type: "int" }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "version", type: new Set(["float", "int"]) }
    ]);
  });

  test("Should correctly merge Any in Set<string>", () => {
    const existingClass: ClassModel = {
      className: "User",
      attributes: [{ name: "status", type: new Set(["str", "Any"]) }]
    };

    const classModel: ClassModel = {
      className: "User",
      attributes: [{ name: "status", type: "int" }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "status", type: new Set(["Any", "int", "str"]) }
    ]);
  });

  test("Should correctly handle merging a Set containing Any", () => {
    const existingClass: ClassModel = {
      className: "Account",
      attributes: [{ name: "balance", type: new Set(["float", "Any"]) }]
    };

    const classModel: ClassModel = {
      className: "Account",
      attributes: [{ name: "balance", type: "int" }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "balance", type: new Set(["Any", "float", "int"]) }
    ]);
  });
});
