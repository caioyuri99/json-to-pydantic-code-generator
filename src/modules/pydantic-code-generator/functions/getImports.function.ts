function getImports(s: string): string {
  const types = [];

  if (s.match(/(?<=^|\s)Any(?=\s|$|\])|\[Any\]/g)) {
    types.push("Any");
  }

  if (s.match(/Dict\[[^\]]+\]/g)) {
    types.push("Dict");
  }

  if (s.match(/List\[[^\]]+\]/g)) {
    types.push("List");
  }

  if (s.match(/Optional\[[^\]]+\]/g)) {
    types.push("Optional");
  }

  if (s.match(/Union\[[^\]]+\]/g)) {
    types.push("Union");
  }

  const pydanticImports = ["BaseModel"];

  if (s.includes("= Field(..., alias='")) {
    pydanticImports.push("Field");
  }

  const pydanticImportsStr = `from pydantic import ${pydanticImports.join(", ")}`;

  if (types.length === 0) {
    return pydanticImportsStr;
  }

  return `from typing import ${types.join(", ")}\n\n${pydanticImportsStr}`;
}

export { getImports };
