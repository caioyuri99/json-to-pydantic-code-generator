import { getImports } from "../../../../src/modules/pydantic-code-generator/functions/getImports.function";
import { dedent } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("getTypingImports", () => {
  test("returns only BaseModel when no other symbols are present", () => {
    const input = dedent`
      class User(BaseModel):
        name: str
    `;
    const output = getImports(input);
    expect(output).toBe("from pydantic import BaseModel");
  });

  test("includes Field when present in the string", () => {
    const input = dedent`
      class User(BaseModel):
        for_: str = Field(..., alias='for')
    `;
    const output = getImports(input);
    expect(output).toBe("from pydantic import BaseModel, Field");
  });

  test("includes Any from typing", () => {
    const input = dedent`
      class User(BaseModel):
        data: Any
    `;
    const output = getImports(input);
    expect(output).toBe(
      ["from typing import Any", "from pydantic import BaseModel"].join("\n\n")
    );
  });

  test("includes List and Optional from typing", () => {
    const input = dedent`
      class Post(BaseModel):
        comments: Optional[List[str]]
    `;
    const output = getImports(input);
    expect(output).toBe(
      [
        "from typing import List, Optional",
        "from pydantic import BaseModel"
      ].join("\n\n")
    );
  });

  test("includes all typing imports when all are present", () => {
    const input = dedent`
      class Config(BaseModel):
        value: Union[int, str, None]
        items: List[str]
        extra: Any
        maybe: Optional[bool]
    `;
    const output = getImports(input);
    expect(output).toBe(
      [
        "from typing import Any, List, Optional, Union",
        "from pydantic import BaseModel"
      ].join("\n\n")
    );
  });

  test("includes both pydantic and typing imports when needed", () => {
    const input = dedent`
      class Model(BaseModel):
        data: Any
        for_: str = Field(..., alias='for')
    `;
    const output = getImports(input);
    expect(output).toBe(
      ["from typing import Any", "from pydantic import BaseModel, Field"].join(
        "\n\n"
      )
    );
  });

  test("sorts typing imports alphabetically", () => {
    const input = dedent`
      class M(BaseModel):
        a: Optional[str]
        b: Union[str, int]
        c: List[str]
        d: Any
    `;
    const output = getImports(input);
    expect(output).toBe(
      [
        "from typing import Any, List, Optional, Union",
        "from pydantic import BaseModel"
      ].join("\n\n")
    );
  });

  test("Any in class' name", () => {
    const input = dedent`
      class AnyData(BaseModel):
        value: int
    `;
    const output = getImports(input);
    expect(output).toBe("from pydantic import BaseModel");
  });

  test("Any in attribute's name", () => {
    const input = dedent`
      class Model(BaseModel):
        field_Any: str
    `;
    const output = getImports(input);
    expect(output).toBe("from pydantic import BaseModel");
  });

  test("Any in generated class' name", () => {
    const input = dedent`
      class ItemAny(BaseModel):
        id: int


      class Container(BaseModel):
        items: List[ItemAny]
    `;
    const output = getImports(input);
    expect(output).toBe(
      ["from typing import List", "from pydantic import BaseModel"].join("\n\n")
    );
  });

  test("includes Dict from typing", () => {
    const input = dedent`
      class User(BaseModel):
        name: str
        profile: Dict[str, Any]
    `;
    const output = getImports(input);
    expect(output).toBe(
      ["from typing import Any, Dict", "from pydantic import BaseModel"].join(
        "\n\n"
      )
    );
  });

  test("should handle Field with None annotation", () => {
    const input = dedent`
    class Model(BaseModel):
      foo: Optional[int] = None
      bar_Baz: Optional[str] = Field(None, alias='bar.Baz')
    `;
    const output = getImports(input);
    expect(output).toBe(dedent`
      from typing import Optional

      from pydantic import BaseModel, Field
      `);
  });
});
