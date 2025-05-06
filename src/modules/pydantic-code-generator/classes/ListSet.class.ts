class ListSet<T> extends Set<T | ListSet<T>> {
  toString(): string {
    return `ListSet { ${[...this].map(String).join(", ")} }`;
  }
}

export { ListSet };
