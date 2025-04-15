import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { mergeAttributes } from "../../../../src/modules/pydantic-code-generator/functions/mergeAttributes.function";
import { ClassModel } from "../../../../src/modules/pydantic-code-generator/types/ClassModel.type";

describe("mergeAttributes", () => {
  test("Should add unique attributes from classModel to existingClass", () => {
    const existingClass: ClassModel = {
      className: "Person",
      attributes: [{ name: "name", type: new TypeSet<string>(["str"]) }]
    };

    const classModel: ClassModel = {
      className: "Person",
      attributes: [{ name: "age", type: new TypeSet<string>(["int"]) }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "name", type: new TypeSet<string>(["str"]) },
      { name: "age", type: new TypeSet<string>(["int"]) }
    ]);
  });

  test("Should merge types when both attributes are strings", () => {
    const existingClass: ClassModel = {
      className: "Person",
      attributes: [{ name: "name", type: new TypeSet<string>(["str"]) }]
    };

    const classModel: ClassModel = {
      className: "Person",
      attributes: [{ name: "name", type: new TypeSet<string>(["int"]) }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "name", type: new TypeSet<string>(["str", "int"]) }
    ]);
  });

  test("Should merge multiple attributes correctly", () => {
    const existingClass: ClassModel = {
      className: "Employee",
      attributes: [
        { name: "id", type: new TypeSet<string>(["int"]) },
        { name: "salary", type: new TypeSet<string>(["float"]) }
      ]
    };

    const classModel: ClassModel = {
      className: "Employee",
      attributes: [
        { name: "id", type: new TypeSet<string>(["str"]) },
        { name: "department", type: new TypeSet<string>(["str"]) }
      ]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "id", type: new TypeSet<string>(["int", "str"]) },
      { name: "salary", type: new TypeSet<string>(["float"]) },
      { name: "department", type: new TypeSet<string>(["str"]) }
    ]);
  });

  test("Should not modify existingClass if classModel has no new attributes", () => {
    const existingClass: ClassModel = {
      className: "Car",
      attributes: [{ name: "brand", type: new TypeSet<string>(["str"]) }]
    };

    const classModel: ClassModel = {
      className: "Car",
      attributes: []
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "brand", type: new TypeSet<string>(["str"]) }
    ]);
  });

  test("Should correctly merge when attributes have Set<string> as type", () => {
    const existingClass: ClassModel = {
      className: "Product",
      attributes: [
        { name: "price", type: new TypeSet<string>(["float"]) },
        { name: "stock", type: new TypeSet<string>(["int"]) }
      ]
    };

    const classModel: ClassModel = {
      className: "Product",
      attributes: [
        { name: "price", type: new TypeSet<string>(["int"]) },
        { name: "stock", type: new TypeSet<string>(["str"]) }
      ]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "price", type: new TypeSet<string>(["float", "int"]) },
      { name: "stock", type: new TypeSet<string>(["int", "str"]) }
    ]);
  });

  test("Should handle merging a string type into an existing Set<string>", () => {
    const existingClass: ClassModel = {
      className: "Device",
      attributes: [{ name: "version", type: new TypeSet<string>(["float"]) }]
    };

    const classModel: ClassModel = {
      className: "Device",
      attributes: [{ name: "version", type: new TypeSet<string>(["int"]) }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "version", type: new TypeSet<string>(["float", "int"]) }
    ]);
  });

  test("Should correctly merge Any in Set<string>", () => {
    const existingClass: ClassModel = {
      className: "User",
      attributes: [
        { name: "status", type: new TypeSet<string>(["str", "Any"]) }
      ]
    };

    const classModel: ClassModel = {
      className: "User",
      attributes: [{ name: "status", type: new TypeSet<string>(["int"]) }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "status", type: new TypeSet<string>(["Any", "int", "str"]) }
    ]);
  });

  test("Should correctly handle merging a Set containing Any", () => {
    const existingClass: ClassModel = {
      className: "Account",
      attributes: [
        { name: "balance", type: new TypeSet<string>(["float", "Any"]) }
      ]
    };

    const classModel: ClassModel = {
      className: "Account",
      attributes: [{ name: "balance", type: new TypeSet<string>(["int"]) }]
    };

    mergeAttributes(classModel, existingClass);

    expect(existingClass.attributes).toEqual([
      { name: "balance", type: new TypeSet<string>(["Any", "float", "int"]) }
    ]);
  });
});
