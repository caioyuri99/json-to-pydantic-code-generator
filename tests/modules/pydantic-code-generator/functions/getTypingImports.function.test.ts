import { getTypingImports } from "../../../../src/modules/pydantic-code-generator/functions/getTypingImports.function";
import { dedent } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

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
