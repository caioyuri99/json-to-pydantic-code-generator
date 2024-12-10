export function removeOptionalAndUnion(s: string): string {
  const regex = /(?:Optional|Union)?\[(.+)\]/;

  let result = s;
  let match;
  while ((match = regex.exec(result))) {
    result = match[1]; // Extrai o conteúdo mais interno
  }

  return result;
}

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
