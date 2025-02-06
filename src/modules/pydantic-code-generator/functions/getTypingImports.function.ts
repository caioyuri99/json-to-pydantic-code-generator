export function getTypingImports(s: string): string {
  const types = [];

  if (s.match(/(?<=^|\s)Any(?=\s|$|\])|\[Any\]/g)) {
    types.push("Any");
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

  if (types.length === 0) {
    return "";
  }

  return `from typing import ${types.join(", ")}`;
}
