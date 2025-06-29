import { dedent } from "../../../src/modules/pydantic-code-generator/utils/utils.module";
import { generatePydanticCode } from "../../../src/modules/pydantic-code-generator/pydantic-code-generator.module";

describe("generatePydanticCode", () => {
  test("should generate a single class from a simple object", () => {
    const json = { id: 1, name: "Alice" };

    const result = generatePydanticCode(json);

    expect(result).toBe(dedent`
      from __future__ import annotations

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
      from __future__ import annotations

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
      from __future__ import annotations

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
      from __future__ import annotations

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
      from __future__ import annotations

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
      from __future__ import annotations

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
      from __future__ import annotations

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
      from __future__ import annotations

      from typing import Optional

      from pydantic import BaseModel


      class Model(BaseModel):
          id: int
          name: str
          age: Optional[int] = None
    `);
  });

  test("generatePydanticCode uses default indentation of 4 spaces", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json);

    expect(code).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Model(BaseModel):
          name: str
          age: int
    `);
  });

  test("generatePydanticCode uses indentation of 2 spaces", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json, "Model", { indentation: 2 });

    expect(code).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Model(BaseModel):
        name: str
        age: int
    `);
  });

  test("generatePydanticCode uses indentation of 1 space", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json, "Model", { indentation: 1 });

    expect(code).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Model(BaseModel):
       name: str
       age: int
    `);
  });

  test("generatePydanticCode uses indentation of 8 spaces", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json, "Model", { indentation: 8 });

    expect(code).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Model(BaseModel):
              name: str
              age: int
    `);
  });

  test("generatePydanticCode throws error if indentation is 0", () => {
    const json = { name: "John", age: 30 };
    expect(() =>
      generatePydanticCode(json, "Model", { indentation: 0 })
    ).toThrow("Indentation must be greater than 0");
  });

  test("generatePydanticCode throws error if indentation is negative", () => {
    const json = { name: "John", age: 30 };
    expect(() =>
      generatePydanticCode(json, "Model", { indentation: -2 })
    ).toThrow("Indentation must be greater than 0");
  });

  test("preferClassReuse as false", () => {
    const json = { user1: { name: "Alice" }, user2: { name: "Bob" } };
    const code = generatePydanticCode(json, "Model", {
      preferClassReuse: false
    });

    expect(code).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class User1(BaseModel):
          name: str


      class User2(BaseModel):
          name: str


      class Model(BaseModel):
          user1: User1
          user2: User2
      `);
  });

  test("preferClassReuse as true", () => {
    const json = { user1: { name: "Alice" }, user2: { name: "Bob" } };
    const code = generatePydanticCode(json, "Model", {
      preferClassReuse: true
    });

    expect(code).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class User1(BaseModel):
          name: str


      class Model(BaseModel):
          user1: User1
          user2: User1
      `);
  });

  test("preferClassReuse with complex, nested structure", () => {
    const json = {
      user1: { user: { name: "Alice", age: 30 } },
      user2: { user: { name: "Bob", age: 25 } }
    };
    const code = generatePydanticCode(json, "Model", {
      preferClassReuse: true
    });

    expect(code).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class User(BaseModel):
          name: str
          age: int


      class User1(BaseModel):
          user: User


      class Model(BaseModel):
          user1: User1
          user2: User1
      `);
  });

  test("preferClassReuse with different structure objects", () => {
    const json = {
      user1: { name: "Alice", age: 30 },
      user2: { name: "Bob", city: "Paris" }
    };
    const code = generatePydanticCode(json, "Model", {
      preferClassReuse: true
    });

    expect(code).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class User1(BaseModel):
          name: str
          age: int


      class User2(BaseModel):
          name: str
          city: str


      class Model(BaseModel):
          user1: User1
          user2: User2
      `);
  });

  test("forceOptional = 'None': all attributes are required", () => {
    const json = {
      name: "Alice",
      age: 30
    };

    const code = generatePydanticCode(json, "Model", {
      forceOptional: "None",
      indentation: 2
    });

    expect(code).toContain("name: str");
    expect(code).toContain("age: int");
    expect(code).not.toContain("Optional[");
  });

  test("forceOptional = 'OnlyRootClass': only root class attributes are optional", () => {
    const json = {
      name: "Alice",
      address: {
        street: "Main St",
        zip: "12345"
      }
    };

    const code = generatePydanticCode(json, "Model", {
      forceOptional: "OnlyRootClass",
      indentation: 2
    });

    expect(code).toContain("name: Optional[str]");
    expect(code).toContain("address: Optional[Address]");
    expect(code).toContain("street: str");
    expect(code).toContain("zip: str");
  });

  test("forceOptional = 'AllClasses': all attributes in all classes are optional", () => {
    const json = {
      name: "Alice",
      address: {
        street: "Main St",
        zip: "12345"
      }
    };

    const code = generatePydanticCode(json, "Model", {
      forceOptional: "AllClasses",
      indentation: 2
    });

    expect(code).toContain("name: Optional[str]");
    expect(code).toContain("address: Optional[Address] = None");
    expect(code).toContain("street: Optional[str] = None");
    expect(code).toContain("zip: Optional[str] = None");
  });

  test("forceOptional not provided: all attributes are required by default", () => {
    const json = {
      id: 1,
      name: "Product"
    };

    const code = generatePydanticCode(json, "Model", {
      indentation: 2
    });

    expect(code).toContain("id: int");
    expect(code).toContain("name: str");
    expect(code).not.toContain("Optional[");
  });

  test("forceOptional = 'AllClasses' with array of objects", () => {
    const json = {
      items: [
        { name: "A", value: 1 },
        { name: "B", value: 2 }
      ]
    };

    const code = generatePydanticCode(json, "Model", {
      forceOptional: "AllClasses",
      indentation: 2
    });

    expect(code).toContain("items: Optional[List[Item]] = None");
    expect(code).toContain("name: Optional[str] = None");
    expect(code).toContain("value: Optional[int] = None");
  });

  test("forceOptional = 'OnlyRootClass' with array of objects", () => {
    const json = {
      items: [{ name: "A", value: 1 }]
    };

    const code = generatePydanticCode(json, "Model", {
      forceOptional: "OnlyRootClass",
      indentation: 2
    });

    expect(code).toContain("items: Optional[List[Item]]");
    expect(code).toContain("name: str");
    expect(code).toContain("value: int");
  });

  test("forceOptional = 'None' with array of objects", () => {
    const json = {
      items: [{ name: "A", value: 1 }]
    };

    const code = generatePydanticCode(json, "Model", {
      forceOptional: "None",
      indentation: 2
    });

    expect(code).toContain("items: List[Item]");
    expect(code).toContain("name: str");
    expect(code).toContain("value: int");
  });

  test("should convert camelCase attributes to snake_case with alias", () => {
    const json = {
      userName: "Alice",
      emailAddress: "alice@example.com"
    };

    const result = generatePydanticCode(json, "User", {
      aliasCamelCase: true,
      indentation: 2
    });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel, Field


      class User(BaseModel):
        user_name: str = Field(..., alias='userName')
        email_address: str = Field(..., alias='emailAddress')
  `);
  });

  test("should not convert camelCase when aliasCamelCase is false", () => {
    const json = {
      userName: "Bob"
    };

    const result = generatePydanticCode(json, "User", {
      aliasCamelCase: false,
      indentation: 2
    });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class User(BaseModel):
        userName: str
  `);
  });

  test("should ignore snake_case attributes even if aliasCamelCase is true", () => {
    const json = {
      user_id: 1,
      fullName: "Test"
    };

    const result = generatePydanticCode(json, "User", {
      aliasCamelCase: true,
      indentation: 2
    });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel, Field


      class User(BaseModel):
        user_id: int
        full_name: str = Field(..., alias='fullName')
  `);
  });

  test("should handle nested camelCase fields with alias", () => {
    const json = {
      userInfo: {
        fullName: "Alice Johnson",
        dateOfBirth: "1990-01-01"
      }
    };

    const result = generatePydanticCode(json, "Model", {
      aliasCamelCase: true,
      indentation: 2
    });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel, Field


      class UserInfo(BaseModel):
        full_name: str = Field(..., alias='fullName')
        date_of_birth: str = Field(..., alias='dateOfBirth')


      class Model(BaseModel):
        user_info: UserInfo = Field(..., alias='userInfo')
  `);
  });

  test("should handle deeply nested camelCase with aliases", () => {
    const json = {
      outerLayer: {
        innerLayer: {
          someValue: 42
        }
      }
    };

    const result = generatePydanticCode(json, "Root", {
      aliasCamelCase: true,
      indentation: 2
    });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel, Field


      class InnerLayer(BaseModel):
        some_value: int = Field(..., alias='someValue')


      class OuterLayer(BaseModel):
        inner_layer: InnerLayer = Field(..., alias='innerLayer')


      class Root(BaseModel):
        outer_layer: OuterLayer = Field(..., alias='outerLayer')
  `);
  });

  test("empty object and empty array", () => {
    const json = {
      user: {
        name: "Alice",
        profile: {}
      },
      posts: []
    };

    const result = generatePydanticCode(json, "Model", { indentation: 2 });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from typing import Any, Dict

      from pydantic import BaseModel


      class User(BaseModel):
        name: str
        profile: Dict[str, Any]


      class Model(BaseModel):
        user: User
        posts: List
      `);
  });

  test("heterogeneus list with empty object", () => {
    const json = {
      tags: ["python", {}, "pydantic"]
    };

    const result = generatePydanticCode(json, "Model", { indentation: 2 });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from typing import Any, Dict, List, Union

      from pydantic import BaseModel


      class Model(BaseModel):
        tags: List[Union[Dict[str, Any], str]]
      `);
  });

  test("object list with empty object", () => {
    const json = {
      shortcuts: [
        {},
        {
          key: "Ctrl+S",
          action: "save"
        }
      ]
    };

    const result = generatePydanticCode(json, "Model", { indentation: 2 });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from typing import List, Optional

      from pydantic import BaseModel


      class Shortcut(BaseModel):
        key: Optional[str] = None
        action: Optional[str] = None


      class Model(BaseModel):
        shortcuts: List[Shortcut]
      `);
  });

  test("empty class input", () => {
    const json = {};

    const result = generatePydanticCode(json, "Model", { indentation: 2 });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Model(BaseModel):
        pass
      `);
  });

  test("None annotation with Field annotation", () => {
    const json = {
      foo: 5,
      "bar.Baz": "hello"
    };

    const result = generatePydanticCode(json, "Model", {
      indentation: 2,
      forceOptional: "OnlyRootClass"
    });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from typing import Optional

      from pydantic import BaseModel, Field


      class Model(BaseModel):
        foo: Optional[int] = None
        bar_Baz: Optional[str] = Field(None, alias='bar.Baz')
      `);
  });

  test("array with null and other types", () => {
    const json = {
      items: [1, null, "text", { key: "value" }, [1, 2, 3]]
    };

    const result = generatePydanticCode(json, "Model", { indentation: 2 });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from typing import List, Optional, Union

      from pydantic import BaseModel


      class Item(BaseModel):
        key: str


      class Model(BaseModel):
        items: List[Optional[Union[Item, List[int], int, str]]]
      `);
  });

  test("generatePydanticCode uses tabs for indentation when useTabs is true", () => {
    const json = { name: "John", age: 30 };
    const code = generatePydanticCode(json, "Model", { useTabs: true });
    const expected = dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Model(BaseModel):
      \tname: str
      \tage: int
    `;
    expect(code).toBe(expected);
  });

  test("should generate Pydantic code from valid JSON string", () => {
    const jsonString = '{"id": 1, "name": "Alice", "active": true}';
    const result = generatePydanticCode(jsonString);

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Model(BaseModel):
          id: int
          name: str
          active: bool
    `);
  });

  test("should generate Pydantic code from JSON string with nested objects", () => {
    const jsonString =
      '{"user": {"id": 1, "profile": {"age": 30, "city": "New York"}}}';
    const result = generatePydanticCode(jsonString, "Root");

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Profile(BaseModel):
          age: int
          city: str


      class User(BaseModel):
          id: int
          profile: Profile


      class Root(BaseModel):
          user: User
    `);
  });

  test("should generate Pydantic code from JSON string with arrays", () => {
    const jsonString = '{"items": ["apple", "banana", "cherry"], "count": 3}';
    const result = generatePydanticCode(jsonString);

    expect(result).toBe(dedent`
      from __future__ import annotations

      from typing import List

      from pydantic import BaseModel


      class Model(BaseModel):
          items: List[str]
          count: int
    `);
  });

  test("should generate Pydantic code from JSON array string", () => {
    const jsonString = '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]';
    const result = generatePydanticCode(jsonString);

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel


      class Model(BaseModel):
          id: int
          name: str
    `);
  });

  test("should throw error for invalid JSON string", () => {
    const invalidJsonString = '{"name": "John", "age": 30,}'; // trailing comma

    expect(() => generatePydanticCode(invalidJsonString)).toThrow();
  });

  test("should throw error for malformed JSON string", () => {
    const malformedJsonString = '{"name": "John", "age":}'; // missing value

    expect(() => generatePydanticCode(malformedJsonString)).toThrow();
  });

  test("should throw error for non-JSON string", () => {
    const nonJsonString = "this is not json";

    expect(() => generatePydanticCode(nonJsonString)).toThrow();
  });

  test("should throw error for empty string", () => {
    const emptyString = "";

    expect(() => generatePydanticCode(emptyString)).toThrow();
  });

  test("should handle JSON string with special characters and options", () => {
    const jsonString =
      '{"userName": "Alice", "emailAddress": "alice@example.com"}';
    const result = generatePydanticCode(jsonString, "User", {
      aliasCamelCase: true,
      indentation: 2
    });

    expect(result).toBe(dedent`
      from __future__ import annotations

      from pydantic import BaseModel, Field


      class User(BaseModel):
        user_name: str = Field(..., alias='userName')
        email_address: str = Field(..., alias='emailAddress')
    `);
  });
});
