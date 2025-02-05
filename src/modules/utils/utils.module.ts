export function uniqueElements<T>(lists: T[][]): T[] {
  const allElements = new Set(lists.flat());

  const frequency = new Map<T, number>();
  allElements.forEach((element) => {
    const count = lists.reduce(
      (acc, list) => acc + (list.includes(element) ? 1 : 0),
      0
    );
    frequency.set(element, count);
  });

  return Array.from(frequency.entries())
    .filter(([_, count]) => count < lists.length)
    .map(([element, _]) => element);
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function dedent(
  strings: TemplateStringsArray,
  ...values: any[]
): string {
  const rawString = strings.reduce((result, str, i) => {
    return `${result}${str}${values || ""}`;
  }, "");

  const lines = rawString.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim() !== "");

  if (nonEmptyLines.length === 0) {
    return "";
  }

  const indentSize = Math.min(
    ...nonEmptyLines.map((line) => line.match(/^\s*/)?.[0].length || 0)
  );

  return lines
    .map((line) =>
      line.startsWith(" ".repeat(indentSize)) ? line.slice(indentSize) : line
    )
    .join("\n")
    .trim();
}

export function unwrapList(s: string): {
  innerType: string;
  listCount: number;
} {
  let listCount = 0;

  while (s.startsWith("List[")) {
    s = s.slice(5, -1);
    listCount++;
  }

  return { innerType: s, listCount };
}

export function wrapList(s: string, listCount: number): string {
  for (let i = 0; i < listCount; i++) {
    s = `List[${s}]`;
  }

  return s;
}
