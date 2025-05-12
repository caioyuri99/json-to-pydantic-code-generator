import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { generateClass } from "../../../../src/modules/pydantic-code-generator/functions/generateClass.function";
import { ClassModel } from "../../../../src/modules/pydantic-code-generator/types/ClassModel.type";
import { dedent } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("generateClass", () => {
  test("Should generate a class with no attributes", () => {
    const input: ClassModel = {
      className: "EmptyClass",
      attributes: []
    };

    const expected = dedent`
      class EmptyClass(BaseModel):
    `;
    expect(generateClass(input)).toBe(expected);
  });

  test("Should generate a class with one attribute", () => {
    const input: ClassModel = {
      className: "SingleAttributeClass",
      attributes: [{ name: "id", type: new TypeSet(["int"]) }]
    };

    const expected = dedent`
      class SingleAttributeClass(BaseModel):
        id: int
    `;
    expect(generateClass(input)).toBe(expected);
  });

  test("Should generate a class with multiple attributes", () => {
    const input: ClassModel = {
      className: "MultiAttributeClass",
      attributes: [
        { name: "name", type: new TypeSet(["str"]) },
        { name: "age", type: new TypeSet(["int"]) },
        { name: "is_active", type: new TypeSet(["bool"]) }
      ]
    };

    const expected = dedent`
      class MultiAttributeClass(BaseModel):
        name: str
        age: int
        is_active: bool
    `;
    expect(generateClass(input)).toBe(expected);
  });

  test("Should handle attribute names with underscores", () => {
    const input: ClassModel = {
      className: "CustomClass",
      attributes: [{ name: "custom_field", type: new TypeSet(["str"]) }]
    };

    const expected = dedent`
      class CustomClass(BaseModel):
        custom_field: str
    `;
    expect(generateClass(input)).toBe(expected);
  });

  test("Should handle attributes with complex types", () => {
    const input: ClassModel = {
      className: "ComplexTypeClass",
      attributes: [
        { name: "tags", type: new ListSet<string>(["str"]) },
        { name: "config", type: new TypeSet<string>(["Any", "Config"]) }
      ]
    };

    const expected = dedent`
      class ComplexTypeClass(BaseModel):
        tags: List[str]
        config: Optional[Config]
    `;
    expect(generateClass(input)).toBe(expected);
  });

  test("should rename Python reserved keyword attribute with underscore and use Field alias", () => {
    const model: ClassModel = {
      className: "Example",
      attributes: [
        { name: "for", type: new Set(["str"]) },
        { name: "class", type: new Set(["int"]) }
      ]
    };

    const code = generateClass(model);

    expect(code).toContain("for_: str = Field(..., alias='for')");
    expect(code).toContain("class_: int = Field(..., alias='class')");
  });

  test("should not rename non-keyword attribute names", () => {
    const model: ClassModel = {
      className: "User",
      attributes: [
        { name: "name", type: new Set(["str"]) },
        { name: "age", type: new Set(["int"]) }
      ]
    };

    const code = generateClass(model);

    expect(code).toContain("name: str");
    expect(code).toContain("age: int");
    expect(code).not.toContain("Field(");
  });

  test("should work with mixed keywords and normal attributes", () => {
    const model: ClassModel = {
      className: "Data",
      attributes: [
        { name: "if", type: new Set(["bool"]) },
        { name: "value", type: new Set(["float"]) }
      ]
    };

    const code = generateClass(model);

    expect(code).toContain("if_: bool = Field(..., alias='if')");
    expect(code).toContain("value: float");
  });

  test("should handle attribute names with spaces", () => {
    const classModel: ClassModel = {
      className: "Person",
      attributes: [
        {
          name: "full name",
          type: new TypeSet(["str"])
        }
      ]
    };

    const result = generateClass(classModel);
    expect(result).toContain("full_name: str = Field(..., alias='full name')");
  });

  test("should handle attribute names with dashes and parentheses", () => {
    const classModel: ClassModel = {
      className: "Product",
      attributes: [
        {
          name: "product-id",
          type: new TypeSet(["int"])
        },
        {
          name: "price (USD)",
          type: new TypeSet(["float"])
        }
      ]
    };

    const result = generateClass(classModel);
    expect(result).toContain(
      "product_id: int = Field(..., alias='product-id')"
    );
    expect(result).toContain(
      "price__USD_: float = Field(..., alias='price (USD)')"
    );
  });

  test("should handle attribute names with symbols and question marks", () => {
    const classModel: ClassModel = {
      className: "User",
      attributes: [
        {
          name: "has_permission?",
          type: new TypeSet(["bool"])
        }
      ]
    };

    const result = generateClass(classModel);
    expect(result).toContain(
      "has_permission_: bool = Field(..., alias='has_permission?')"
    );
  });

  test("should handle attribute names with multiple consecutive special characters", () => {
    const classModel: ClassModel = {
      className: "Metrics",
      attributes: [
        {
          name: "cpu%%usage!!!",
          type: new TypeSet(["float"])
        }
      ]
    };

    const result = generateClass(classModel);
    expect(result).toContain(
      "cpu__usage___: float = Field(..., alias='cpu%%usage!!!')"
    );
  });

  test("should handle attribute names starting with a number", () => {
    const classModel: ClassModel = {
      className: "Record",
      attributes: [
        {
          name: "123status",
          type: new TypeSet(["str"])
        }
      ]
    };

    const result = generateClass(classModel);
    expect(result).toContain(
      "field_123status: str = Field(..., alias='123status')"
    );
  });

  test("should handle names starting with a number and containing special characters", () => {
    const classModel: ClassModel = {
      className: "Entry",
      attributes: [
        {
          name: "42%!value",
          type: new TypeSet(["int"])
        }
      ]
    };

    const result = generateClass(classModel);
    expect(result).toContain(
      "field_42__value: int = Field(..., alias='42%!value')"
    );
  });
});
