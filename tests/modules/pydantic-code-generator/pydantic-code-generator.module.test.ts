import { dedent } from "../../../src/modules/pydantic-code-generator/utils/utils.module";
import { generatePydanticCode } from "../../../src/modules/pydantic-code-generator/pydantic-code-generator.module";

describe("generatePydanticCode", () => {
  test("should generate a single class from a simple object", () => {
    const json = { id: 1, name: "Alice" };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from pydantic import BaseModel


      class Model(BaseModel):
          id: int
          name: str
    `);
  });

  test("should generate multiple nested classes from an object with nested structures", () => {
    const json = {
      id: 1,
      profile: {
        age: 25,
        address: { city: "New York", zip: "10001" }
      }
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from pydantic import BaseModel


      class Address(BaseModel):
          city: str
          zip: str


      class Profile(BaseModel):
          age: int
          address: Address


      class Model(BaseModel):
          id: int
          profile: Profile
    `);
  });

  test("should generate a class with List type for array attributes", () => {
    const json = {
      id: 1,
      tags: ["python", "typescript"]
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import List

      from pydantic import BaseModel


      class Model(BaseModel):
          id: int
          tags: List[str]
    `);
  });

  test("should generate correct types when attributes have mixed types", () => {
    const json = {
      id: 1,
      value: "text",
      optional_field: null
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import Any

      from pydantic import BaseModel


      class Model(BaseModel):
          id: int
          value: str
          optional_field: Any
    `);
  });

  test("should handle an array of objects as input", () => {
    const json = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ];

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from pydantic import BaseModel


      class Model(BaseModel):
          id: int
          name: str
    `);
  });

  test("should generate a class for an array of objects with nested structures", () => {
    const json = [
      {
        id: 1,
        profile: { age: 25, city: "New York" }
      },
      {
        id: 2,
        profile: { age: 30, city: "Los Angeles" }
      }
    ];

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from pydantic import BaseModel


      class Profile(BaseModel):
          age: int
          city: str


      class Model(BaseModel):
          id: int
          profile: Profile
    `);
  });

  test("should correctly handle deeply nested lists", () => {
    const json = {
      matrix: [
        [
          [1, 2],
          [3, 4]
        ],
        [
          [5, 6],
          [7, 8]
        ]
      ]
    };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import List

      from pydantic import BaseModel


      class Model(BaseModel):
          matrix: List[List[List[int]]]
    `);
  });

  test("should correctly process an object with missing attributes across instances", () => {
    const json = [
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob" }
    ];

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from typing import Optional

      from pydantic import BaseModel


      class Model(BaseModel):
          id: int
          name: str
          age: Optional[int]
    `);
  });

  test("generatePydanticCode uses default indentation of 4 spaces", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json);

    expect(code).toBe(dedent`
      from pydantic import BaseModel


      class Model(BaseModel):
          name: str
          age: int
    `);
  });

  test("generatePydanticCode uses indentation of 2 spaces", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json, 2);

    expect(code).toBe(dedent`
      from pydantic import BaseModel


      class Model(BaseModel):
        name: str
        age: int
    `);
  });

  test("generatePydanticCode uses indentation of 1 space", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json, 1);

    expect(code).toBe(dedent`
      from pydantic import BaseModel


      class Model(BaseModel):
       name: str
       age: int
    `);
  });

  test("generatePydanticCode uses indentation of 8 spaces", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json, 8);

    console.log(code);

    expect(code).toBe(dedent`
      from pydantic import BaseModel


      class Model(BaseModel):
              name: str
              age: int
    `);
  });

  test("generatePydanticCode throws error if indentation is 0", () => {
    const json = { name: "John", age: 30 };
    expect(() => generatePydanticCode(json, 0)).toThrow(
      "ERROR: Indentation must be greater than 0"
    );
  });

  test("generatePydanticCode throws error if indentation is negative", () => {
    const json = { name: "John", age: 30 };
    expect(() => generatePydanticCode(json, -2)).toThrow(
      "ERROR: Indentation must be greater than 0"
    );
  });
});
