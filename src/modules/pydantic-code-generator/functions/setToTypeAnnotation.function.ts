export function setToTypeAnnotation(s: Set<string>): string {
  if (s.size > 1) {
    if (s.delete("Any")) {
      return `Optional[${setToTypeAnnotation(s)}]`;
    }

    return `Union[${[...s].sort().join(", ")}]`;
  }

  return [...s][0];
}
