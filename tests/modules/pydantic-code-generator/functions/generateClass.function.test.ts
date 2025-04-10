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
      attributes: [{ name: "id", type: "int" }]
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
        { name: "name", type: "str" },
        { name: "age", type: "int" },
        { name: "is_active", type: "bool" }
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
      attributes: [{ name: "custom_field", type: "str" }]
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
});
