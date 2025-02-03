import { ClassModel } from "../../src/modules/pydantic-code-generator/interfaces/ClassModel.interface";
import {
  generateClass,
  generatePydanticCode,
  getType,
  getTypingImports,
  mergeAttributes,
  mergeClasses,
  mergeTypes,
  processArray,
  setOptional,
  setToTypeAnnotation
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

describe("processArray", () => {
  test("should return ClassAttribute with List[int] for homogeneous number array", () => {
    const result = processArray([1, 2, 3], "numbers");
    expect(result).toEqual({ name: "numbers", type: "List[int]" });
  });

  test("should return ClassAttribute with List[str] for homogeneous string array", () => {
    const result = processArray(["a", "b", "c"], "letters");
    expect(result).toEqual({ name: "letters", type: "List[str]" });
  });

  test("should return ClassAttribute with List[bool] for homogeneous boolean array", () => {
    const result = processArray([true, false, true], "flags");
    expect(result).toEqual({ name: "flags", type: "List[bool]" });
  });

  test("should return ClassAttribute with List[Any] for heterogeneous array", () => {
    const result = processArray([1, "a", true], "mixed");
    expect(result).toEqual({ name: "mixed", type: "List[Any]" });
  });

  test("should return ClassModel[] for an array of objects", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "name", type: "str" }
        ]
      }
    ]);
  });

  test("should process nested objects into ClassModels", () => {
    const input = [
      {
        id: 1,
        profile: { age: 25, city: "New York" }
      },
      {
        id: 2,
        profile: { age: 30, city: "San Francisco" }
      }
    ];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "Profile",
        attributes: [
          { name: "age", type: "int" },
          { name: "city", type: "str" }
        ]
      },
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "profile", type: "Profile" }
        ]
      }
    ]);
  });

  test("should process nested arrays of objects into ClassModels", () => {
    const input = [
      {
        id: 1,
        friends: [
          { name: "Alice", age: 25 },
          { name: "Bob", age: 30 }
        ]
      }
    ];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "Friends",
        attributes: [
          { name: "name", type: "str" },
          { name: "age", type: "int" }
        ]
      },
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "friends", type: "List[Friends]" }
        ]
      }
    ]);
  });

  test("should return ClassAttribute with Set containing multiple types for mixed attribute types", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: "2", name: "Bob" }
    ];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: new Set(["int", "str"]) },
          { name: "name", type: "str" }
        ]
      }
    ]);
  });

  test("should include Any in type when attribute is missing in some objects", () => {
    const input = [{ id: 1, name: "Alice" }, { id: 2 }];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "name", type: new Set(["str", "Any"]) }
        ]
      }
    ]);
  });

  test("should process lists of primitive types inside objects", () => {
    const input = [
      { id: 1, tags: ["python", "typescript"] },
      { id: 2, tags: ["javascript"] }
    ];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "tags", type: "List[str]" }
        ]
      }
    ]);
  });

  test("should return List[Any] for heterogeneous lists inside objects", () => {
    const input = [{ id: 1, values: [1, "text", true] }];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "values", type: "List[Any]" }
        ]
      }
    ]);
  });

  // FIXME: fazer lógica para a função generateClasses ser chamada com um array como input, sem isso esse teste quebra
  /*
  test("should handle lists of lists of primitive types", () => {
    const input = [
      {
        id: 1,
        matrix: [
          [1, 2],
          [3, 4]
        ]
      }
    ];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "matrix", type: "List[List[int]]" }
        ]
      }
    ]);
  });
  */

  test("should handle deeply nested structures", () => {
    const input = [
      { id: 1, metadata: { details: { verified: true, level: 5 } } }
    ];

    const result = processArray(input, "User");

    expect(result).toEqual([
      {
        className: "Details",
        attributes: [
          { name: "verified", type: "bool" },
          { name: "level", type: "int" }
        ]
      },
      {
        className: "Metadata",
        attributes: [{ name: "details", type: "Details" }]
      },
      {
        className: "User",
        attributes: [
          { name: "id", type: "int" },
          { name: "metadata", type: "Metadata" }
        ]
      }
    ]);
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
          { name: "id", type: new Set(["Any", "int"]) },
          { name: "email", type: new Set(["Any", "str"]) }
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
        attributes: [{ name: "id", type: new Set(["int", "str"]) }]
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
          { name: "id", type: new Set(["Any", "int"]) },
          { name: "email", type: new Set(["Any", "str"]) }
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
          { name: "id", type: new Set(["Any", "int"]) },
          { name: "email", type: new Set(["Any", "str"]) }
        ]
      }
    ];

    expect(mergeClasses(objects)).toEqual(expected);
  });
});

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

describe("mergeTypes", () => {
  test("Should return oldTypes when both oldTypes and typeToAdd are the same string", () => {
    const oldTypes = "str";
    const typeToAdd = "str";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toBe(oldTypes);
  });

  test("Should return a Set containing oldTypes and typeToAdd when they are different strings", () => {
    const oldTypes = "str";
    const typeToAdd = "int";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int"]));
  });

  test("Should return oldTypes as a Set and add typeToAdd when oldTypes is already a Set", () => {
    const oldTypes = new Set(["str", "int"]);
    const typeToAdd = "float";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int", "float"]));
  });

  test("Should handle adding a duplicate type to an existing Set", () => {
    const oldTypes = new Set(["str", "int"]);
    const typeToAdd = "str";

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int"]));
  });

  test("Should handle adding an empty Set to oldTypes as a string", () => {
    const oldTypes = "str";
    const typeToAdd = new Set<string>();

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str"]));
  });

  test("Should handle adding a non-empty Set to oldTypes as a string", () => {
    const oldTypes = "str";
    const typeToAdd = new Set(["int", "float"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int", "float"]));
  });

  test("Should handle adding a Set to oldTypes as an existing Set", () => {
    const oldTypes = new Set(["str"]);
    const typeToAdd = new Set(["int", "float"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int", "float"]));
  });

  test("Should handle adding an empty Set to oldTypes as an existing Set", () => {
    const oldTypes = new Set(["str"]);
    const typeToAdd = new Set<string>();

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str"]));
  });

  test("Should handle merging two identical Sets", () => {
    const oldTypes = new Set(["str", "int"]);
    const typeToAdd = new Set(["str", "int"]);

    const result = mergeTypes(oldTypes, typeToAdd);

    expect(result).toEqual(new Set(["str", "int"]));
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
        { name: "config", type: new Set(["Any", "Config"]) }
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

describe("setToTypeAnnotation", () => {
  test("Should return a single type when Set contains one element", () => {
    const input = new Set(["str"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("str");
  });

  test("Should return a Union of types when Set contains multiple elements", () => {
    const input = new Set(["str", "int"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Union[int, str]");
  });

  test("Should handle a Set with multiple elements in arbitrary order", () => {
    const input = new Set(["float", "bool", "str"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Union[bool, float, str]");
  });

  test("Should handle a Set with duplicate elements by removing duplicates", () => {
    const input = new Set(["str", "int", "str"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Union[int, str]");
  });

  test("Should handle a Set with a single element 'Any'", () => {
    const input = new Set(["Any"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Any");
  });

  test("Should return Optional[type] when Set contains 'Any' and one other type", () => {
    const input = new Set(["str", "Any"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Optional[str]");
  });

  test("Should return Optional[Union[...]] when Set contains 'Any' and multiple types", () => {
    const input = new Set(["str", "int", "Any"]);

    const result = setToTypeAnnotation(input);

    expect(result).toBe("Optional[Union[int, str]]");
  });
});
