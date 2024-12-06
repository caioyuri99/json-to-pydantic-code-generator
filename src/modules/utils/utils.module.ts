export function removeOptionalAndUnion(s: string): string {
  const regex = /(?:Optional|Union)?\[(.+)\]/;

  let result = s;
  let match;
  while ((match = regex.exec(result))) {
    result = match[1]; // Extrai o conteúdo mais interno
  }

  return result;
}
