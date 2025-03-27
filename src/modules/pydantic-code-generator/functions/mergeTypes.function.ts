export function mergeTypes(
  oldTypes: string | Set<string>,
  typeToAdd: string | Set<string>
): string | Set<string> {
  if (typeof oldTypes === "string") {
    if (typeof typeToAdd === "string") {
      if (oldTypes === typeToAdd) {
        return oldTypes;
      }

      const newSet = new Set([oldTypes, typeToAdd]);

      if (newSet.has("int") && newSet.has("float")) {
        newSet.delete("int");
      }

      return newSet;
    }

    const newSet = typeToAdd.add(oldTypes);

    if (newSet.has("int") && newSet.has("float")) {
      newSet.delete("int");
    }

    return newSet;
  }

  if (typeof typeToAdd === "string") {
    const newSet = oldTypes.add(typeToAdd);

    if (newSet.has("int") && newSet.has("float")) {
      newSet.delete("int");
    }

    return newSet;
  }

  const newSet = new Set([...oldTypes, ...typeToAdd]);

  if (newSet.has("int") && newSet.has("float")) {
    newSet.delete("int");
  }

  return newSet;
}
