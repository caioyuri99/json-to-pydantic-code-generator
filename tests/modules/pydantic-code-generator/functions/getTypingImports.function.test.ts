import { getImports } from "../../../../src/modules/pydantic-code-generator/functions/getImports.function";

describe("getTypingImports", () => {
  test("returns only BaseModel when no other symbols are present", () => {
    const input = "class User(BaseModel):\n  name: str";
    const output = getImports(input);
    expect(output).toBe("from pydantic import BaseModel");
  });

  test("includes Field when present in the string", () => {
    const input =
      "class User(BaseModel):\n  for_: str = Field(..., alias='for')";
    const output = getImports(input);
    expect(output).toBe("from pydantic import BaseModel, Field");
  });

  test("includes Any from typing", () => {
    const input = "class User(BaseModel):\n  data: Any";
    const output = getImports(input);
    expect(output).toBe(
      ["from typing import Any", "from pydantic import BaseModel"].join("\n\n")
    );
  });

  test("includes List and Optional from typing", () => {
    const input = "class Post(BaseModel):\n  comments: Optional[List[str]]";
    const output = getImports(input);
    expect(output).toBe(
      [
        "from typing import List, Optional",
        "from pydantic import BaseModel"
      ].join("\n\n")
    );
  });

  test("includes all typing imports when all are present", () => {
    const input =
      "class Config(BaseModel):\n  value: Union[int, str, None]\n  items: List[str]\n  extra: Any\n  maybe: Optional[bool]";
    const output = getImports(input);
    expect(output).toBe(
      [
        "from typing import Any, List, Optional, Union",
        "from pydantic import BaseModel"
      ].join("\n\n")
    );
  });

  test("includes both pydantic and typing imports when needed", () => {
    const input =
      "class Model(BaseModel):\n  data: Any\n  for_: str = Field(..., alias='for')";
    const output = getImports(input);
    expect(output).toBe(
      ["from typing import Any", "from pydantic import BaseModel, Field"].join(
        "\n\n"
      )
    );
  });

  test("sorts typing imports alphabetically", () => {
    const input =
      "class M(BaseModel):\n  a: Optional[str]\n  b: Union[str, int]\n  c: List[str]\n  d: Any";
    const output = getImports(input);
    expect(output).toBe(
      [
        "from typing import Any, List, Optional, Union",
        "from pydantic import BaseModel"
      ].join("\n\n")
    );
  });
});
