import { ClassModel } from "../../src/modules/pydantic-code-generator/interfaces/ClassModel.interface";
import {
  generateClass,
  generatePydanticCode,
  getType,
  getTypingImports,
  mergeClasses,
  mergeTypes
} from "../../src/modules/pydantic-code-generator/pydantic-code-generator.module";
import { dedent } from "../../src/modules/utils/utils.module";

describe("generatePydanticCode", () => {
  test("should generate pydantic code", () => {
    const json = {
      name: "John",
      age: 20,
      address: {
        city: "New York",
        street: "Wall Street"
      }
    };
    const expected = dedent`
        from pydantic import BaseModel


        class Address(BaseModel):
          city: str
          street: str


        class Model(BaseModel):
          name: str
          age: int
          address: Address
      `;

    const result = generatePydanticCode(json);

    expect(result).toBe(expected);
  });

  test("should generate Sort, Content, Sort1, Pageable and Model classes", () => {
    const json = {
      content: [
        {
          id: 1,
          sort: {
            direction: "ASC"
          }
        }
      ],
      pageable: {
        sort: {
          sorted: false
        }
      },
      sort: {
        sorted: false
      }
    };

    const expected = dedent`
        from pydantic import BaseModel

        from typing import List


        class Sort(BaseModel):
          direction: str


        class Content(BaseModel):
          id: int
          sort: Sort


        class Sort1(BaseModel):
          sorted: bool


        class Pageable(BaseModel):
          sort: Sort1


        class Model(BaseModel):
          content: List[Content]
          pageable: Pageable
          sort: Sort1
      `;

    const result = generatePydanticCode(json);

    expect(result).toBe(expected);
  });

  test("should generate Sort, Content, Sort1, Pageable and Model classes (with arrays)", () => {
    const json = {
      content: [
        {
          id: 1,
          sort: [
            {
              direction: "ASC"
            }
          ]
        }
      ],
      pageable: [
        {
          sort: [
            {
              sorted: false
            }
          ]
        }
      ],
      sort: [
        {
          sorted: false
        }
      ]
    };

    const expected = dedent`
        from pydantic import BaseModel

        from typing import List


        class Sort(BaseModel):
          direction: str


        class Content(BaseModel):
          id: int
          sort: List[Sort]


        class Sort1(BaseModel):
          sorted: bool


        class Pageable(BaseModel):
          sort: List[Sort1]


        class Model(BaseModel):
          content: List[Content]
          pageable: List[Pageable]
          sort: List[Sort1]
      `;

    const result = generatePydanticCode(json);

    expect(result).toBe(expected);
  });
});

describe("mergeClasses", () => {
  test("empty input", () => {
    const objects: ClassModel[] = [];

    expect(mergeClasses(objects)).toEqual([]);
  });

  test("no duplication", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      {
        className: "Product",
        attributes: [{ name: "price", type: "float" }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(objects));
  });

  test("identical classes with different attributes", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      { className: "User", attributes: [{ name: "email", type: "str" }] }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: "Optional[int]" },
          { name: "email", type: "Optional[str]" }
        ]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("duplicate attributes and conflicting types", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      { className: "User", attributes: [{ name: "id", type: "str" }] }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [{ name: "id", type: "Union[int, str]" }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("multiple classes with partial merging", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      { className: "User", attributes: [{ name: "email", type: "str" }] },
      {
        className: "Product",
        attributes: [{ name: "price", type: "float" }]
      }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: "Optional[int]" },
          { name: "email", type: "Optional[str]" }
        ]
      },
      {
        className: "Product",
        attributes: [{ name: "price", type: "float" }]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expect.arrayContaining(expected));
  });

  test("multiple levels of duplication", () => {
    const objects: ClassModel[] = [
      { className: "User", attributes: [{ name: "id", type: "int" }] },
      { className: "User", attributes: [{ name: "email", type: "str" }] },
      { className: "User", attributes: [{ name: "email", type: "str" }] },
      { className: "User", attributes: [{ name: "id", type: "int" }] }
    ];

    const expected: ClassModel[] = [
      {
        className: "User",
        attributes: [
          { name: "id", type: "Optional[int]" },
          { name: "email", type: "Optional[str]" }
        ]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expected);
  });
});

describe("mergeTypes", () => {
  test("must return the same type when types are equal", () => {
    expect(mergeTypes("int", "int")).toBe("int");
    expect(mergeTypes("str", "str")).toBe("str");
    expect(mergeTypes("Optional[int]", "Optional[int]")).toBe("Optional[int]");
  });

  test("should return Optional[Type] when one of the types is Any", () => {
    expect(mergeTypes("Any", "int")).toBe("Optional[int]");
    expect(mergeTypes("str", "Any")).toBe("Optional[str]");
    expect(mergeTypes("Optional[Any]", "int")).toBe("Optional[int]");
  });

  test("should return Union[Type1, Type2] when types are different", () => {
    expect(mergeTypes("int", "str")).toBe("Union[int, str]");
    expect(mergeTypes("bool", "float")).toBe("Union[bool, float]");
  });

  test("must handle Optional correctly", () => {
    expect(mergeTypes("Optional[int]", "int")).toBe("Optional[int]");
    expect(mergeTypes("Optional[int]", "Optional[str]")).toBe(
      "Optional[Union[int, str]]"
    );
  });

  test("must handle Union correctly", () => {
    expect(mergeTypes("Union[int, str]", "int")).toBe("Union[int, str]");
    expect(mergeTypes("Union[str, int]", "float")).toBe(
      "Union[float, int, str]"
    );
    expect(mergeTypes("Optional[Union[str, int]]", "int")).toBe(
      "Optional[Union[int, str]]"
    );
  });

  test("must handle combinations of Optional and Union", () => {
    expect(mergeTypes("Optional[int]", "Union[str, int]")).toBe(
      "Optional[Union[int, str]]"
    );
    expect(mergeTypes("Optional[Union[int, str]]", "Optional[float]")).toBe(
      "Optional[Union[float, int, str]]"
    );
  });
});

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
        { name: "tags", type: "List[str]" },
        { name: "config", type: "Optional[Dict[str, Any]]" }
      ]
    };

    const expected = dedent`
      class ComplexTypeClass(BaseModel):
        tags: List[str]
        config: Optional[Dict[str, Any]]
    `;
    expect(generateClass(input)).toBe(expected);
  });
});

describe("getType", () => {
  test("Should return 'str' for a string input", () => {
    expect(getType("hello")).toBe("str");
  });

  test("Should return 'int' for an integer input", () => {
    expect(getType(42)).toBe("int");
  });

  test("Should return 'float' for a float input", () => {
    expect(getType(3.14)).toBe("float");
  });

  test("Should return 'bool' for a boolean input", () => {
    expect(getType(true)).toBe("bool");
    expect(getType(false)).toBe("bool");
  });

  test("Should return 'Any' for an undefined or null input", () => {
    expect(getType(undefined)).toBe("Any");
    expect(getType(null)).toBe("Any");
  });

  test("Should return 'Any' for an array input", () => {
    expect(getType([1, 2, 3])).toBe("Any");
  });

  test("Should return 'Any' for an object input", () => {
    expect(getType({ key: "value" })).toBe("Any");
  });

  test("Should return 'Any' for a function input", () => {
    expect(getType(() => {})).toBe("Any");
  });

  test("Should return 'str' for a string literal", () => {
    expect(getType("test")).toBe("str");
  });

  test("Should return 'int' for a number literal", () => {
    expect(getType(100)).toBe("int");
  });

  test("Should return 'bool' for a boolean literal", () => {
    expect(getType(false)).toBe("bool");
    expect(getType(true)).toBe("bool");
  });

  test("Should return 'float' for a floating-point literal", () => {
    expect(getType(1.23)).toBe("float");
  });
});

describe("getTypingImports", () => {
  test("Should return an empty string when no relevant type is present", () => {
    const input = dedent`
      from pydantic import BaseModel

      class User(BaseModel):
          name: str
          age: int
    `;
    expect(getTypingImports(input)).toBe("");
  });

  test("Should return only the types present in type annotations", () => {
    const input = dedent`
      from pydantic import BaseModel

      class User(BaseModel):
          name: Optional[str]
          age: int
    `;
    expect(getTypingImports(input)).toBe("from typing import Optional");
  });

  test("Should detect multiple relevant types in type annotations", () => {
    const input = dedent`
      from pydantic import BaseModel

      class User(BaseModel):
          name: Optional[Union[str, int]]
          tags: List[str]
          metadata: Any
    `;
    expect(getTypingImports(input)).toBe(
      "from typing import Any, List, Optional, Union"
    );
  });

  test("Should ignore types in class names", () => {
    const input = dedent`
      from pydantic import BaseModel

      class Union(BaseModel):
          name: str
          age: int

      class Any(BaseModel):
          value: float
    `;
    expect(getTypingImports(input)).toBe("");
  });

  test("Should ignore types in atribute names", () => {
    const input = dedent`
      from pydantic import BaseModel

      class UserList(BaseModel):
          items: str
    `;
    expect(getTypingImports(input)).toBe("");
  });

  test("Should handle imports with multiple attributes", () => {
    const input = dedent`
      from pydantic import BaseModel

      class User(BaseModel):
          name: Optional[str]
          age: int

      class Post(BaseModel):
          content: Union[str, None]
          metadata: List[Any]
    `;
    expect(getTypingImports(input)).toBe(
      "from typing import Any, List, Optional, Union"
    );
  });

  test("Should ignore irrelevant uses of relevant words", () => {
    const input = dedent`
      from pydantic import BaseModel

      class UserOptional(BaseModel):
          name: str
          age: int
    `;
    expect(getTypingImports(input)).toBe("");
  });
});
