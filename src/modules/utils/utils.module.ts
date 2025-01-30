export function uniqueElements<T>(listas: T[][]): T[] {
  const todosOsElementos = new Set(listas.flat());

  const frequencia = new Map<T, number>();
  todosOsElementos.forEach((elemento) => {
    const count = listas.reduce(
      (acc, lista) => acc + (lista.includes(elemento) ? 1 : 0),
      0
    );
    frequencia.set(elemento, count);
  });

  return Array.from(frequencia.entries())
    .filter(([_, count]) => count < listas.length)
    .map(([elemento, _]) => elemento);
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
