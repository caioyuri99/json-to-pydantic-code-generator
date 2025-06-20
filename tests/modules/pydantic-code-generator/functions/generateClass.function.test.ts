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
          pass
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
          config: Optional[Config] = None
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

  test("generateClass should resolve attribute name conflicts caused by normalization", () => {
    const input: ClassModel = {
      className: "Example",
      attributes: [
        { name: "first-name", type: new Set(["str"]) },
        { name: "first_name", type: new Set(["str"]) },
        { name: "first name", type: new Set(["str"]) }
      ]
    };

    const result = generateClass(input);

    expect(result).toContain(dedent`
    class Example(BaseModel):
        first_name_1: str = Field(..., alias='first-name')
        first_name: str
        first_name_2: str = Field(..., alias='first name')
  `);
  });

  test("generateClass should apply multiple suffixes to avoid multiple normalized conflicts", () => {
    const input: ClassModel = {
      className: "ComplexExample",
      attributes: [
        { name: "attr!", type: new Set(["str"]) },
        { name: "attr@", type: new Set(["str"]) },
        { name: "attr#", type: new Set(["str"]) },
        { name: "attr", type: new Set(["str"]) }
      ]
    };

    const result = generateClass(input);

    expect(result).toBe(dedent`
    class ComplexExample(BaseModel):
        attr_: str = Field(..., alias='attr!')
        attr__1: str = Field(..., alias='attr@')
        attr__2: str = Field(..., alias='attr#')
        attr: str
  `);
  });

  test("converts camelCase to snake_case and adds alias when aliasCamelCase is true", () => {
    const model: ClassModel = {
      className: "Model",
      attributes: [
        { name: "myValue", type: new TypeSet(["int"]) },
        { name: "anotherValue", type: new TypeSet(["str"]) }
      ]
    };

    const result = generateClass(model, 2, true);

    expect(result).toBe(dedent`
    class Model(BaseModel):
      my_value: int = Field(..., alias='myValue')
      another_value: str = Field(..., alias='anotherValue')
  `);
  });

  test("does not convert or add alias when aliasCamelCase is false", () => {
    const model: ClassModel = {
      className: "Model",
      attributes: [
        { name: "myValue", type: new TypeSet(["int"]) },
        { name: "anotherValue", type: new TypeSet(["str"]) }
      ]
    };

    const result = generateClass(model, 2, false);

    expect(result).toBe(dedent`
    class Model(BaseModel):
      myValue: int
      anotherValue: str
  `);
  });

  test("mixed naming: only camelCase names get converted and aliased", () => {
    const model: ClassModel = {
      className: "MixedModel",
      attributes: [
        { name: "myValue", type: new TypeSet(["int"]) },
        { name: "snake_case", type: new TypeSet(["str"]) }
      ]
    };

    const result = generateClass(model, 2, true);

    expect(result).toBe(dedent`
    class MixedModel(BaseModel):
      my_value: int = Field(..., alias='myValue')
      snake_case: str
  `);
  });

  test("test camelCase to snake_case conversion", () => {
    const model: ClassModel = {
      className: "TestModel",
      attributes: [
        { name: "myValue", type: new TypeSet(["int"]) },
        { name: "anotherTestHere", type: new TypeSet(["int"]) },
        { name: "HTMLParser", type: new TypeSet(["int"]) },
        { name: "getHTTPResponse", type: new TypeSet(["int"]) },
        { name: "parseXMLAndJSON", type: new TypeSet(["int"]) },
        { name: "VALUE", type: new TypeSet(["int"]) },
        { name: "value", type: new TypeSet(["int"]) },
        { name: "1stPlace", type: new TypeSet(["int"]) },
        { name: "error404Code", type: new TypeSet(["int"]) },
        { name: "error404HTMLCode", type: new TypeSet(["int"]) },
        { name: "price($USD)", type: new TypeSet(["int"]) },
        { name: "order#ID", type: new TypeSet(["int"]) },
        { name: "last-Modified@Date", type: new TypeSet(["int"]) }
      ]
    };

    const result = generateClass(model, 2, true);

    expect(result).toBe(dedent`
      class TestModel(BaseModel):
        my_value: int = Field(..., alias='myValue')
        another_test_here: int = Field(..., alias='anotherTestHere')
        html_parser: int = Field(..., alias='HTMLParser')
        get_http_response: int = Field(..., alias='getHTTPResponse')
        parse_xml_and_json: int = Field(..., alias='parseXMLAndJSON')
        value_1: int = Field(..., alias='VALUE')
        value: int
        field_1st_place: int = Field(..., alias='1stPlace')
        error404_code: int = Field(..., alias='error404Code')
        error404_html_code: int = Field(..., alias='error404HTMLCode')
        price__usd_: int = Field(..., alias='price($USD)')
        order_id: int = Field(..., alias='order#ID')
        last_modified_date: int = Field(..., alias='last-Modified@Date')
      `);
  });

  test("should use tabs for indentation when useTabs is true", () => {
    const model: ClassModel = {
      className: "TabClass",
      attributes: [
        { name: "id", type: new TypeSet(["int"]) },
        { name: "name", type: new TypeSet(["str"]) }
      ]
    };

    const expected = [
      "class TabClass(BaseModel):",
      "\tid: int",
      "\tname: str"
    ].join("\n");
    expect(generateClass(model, 1, false, true)).toBe(expected);
  });

  test("should use tabs for indentation with complex attributes and useTabs true", () => {
    const model: ClassModel = {
      className: "TabComplexClass",
      attributes: [
        { name: "tags", type: new ListSet(["str"]) },
        { name: "config", type: new TypeSet(["Any", "Config"]) }
      ]
    };
    const expected = [
      "class TabComplexClass(BaseModel):",
      "\ttags: List[str]",
      "\tconfig: Optional[Config] = None"
    ].join("\n");
    expect(generateClass(model, 1, false, true)).toBe(expected);
  });
});
