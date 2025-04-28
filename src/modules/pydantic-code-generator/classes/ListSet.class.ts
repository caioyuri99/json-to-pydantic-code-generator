class ListSet<T> extends Set<T | ListSet<T>> {
  add(value: T | ListSet<T>): this {
    if (value instanceof ListSet) {
      const alreadyHasListSet = [...this].find((v) => v instanceof ListSet);
      if (alreadyHasListSet) {
        value.forEach((e) => alreadyHasListSet.add(e));

        return this;
      }
    }
    super.add(value);
    return this;
  }

  toString(): string {
    return `ListSet { ${[...this].map(String).join(", ")}}`;
  }

  equals(other: ListSet<T>): boolean {
    if (!(other instanceof ListSet)) return false;

    if (this.size !== other.size) return false;

    const used = new Set();

    for (const a of this) {
      let found = false;
      for (const b of other) {
        if (used.has(b)) continue;

        if (a instanceof ListSet && b instanceof ListSet) {
          if (a.equals(b)) {
            used.add(b);
            found = true;
            break;
          }
        } else if (!(a instanceof ListSet) && !(b instanceof ListSet)) {
          if (a === b) {
            used.add(b);
            found = true;
            break;
          }
        }
      }

      if (!found) return false;
    }

    return true;
  }
}

export { ListSet };
