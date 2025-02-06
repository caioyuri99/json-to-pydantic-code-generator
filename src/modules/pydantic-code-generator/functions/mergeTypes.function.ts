export function mergeTypes(
  oldTypes: string | Set<string>,
  typeToAdd: string | Set<string>
): string | Set<string> {
  if (typeof oldTypes === "string") {
    if (typeof typeToAdd === "string") {
      if (oldTypes === typeToAdd) {
        return oldTypes;
      }

      return new Set([oldTypes, typeToAdd]);
    }

    return typeToAdd.add(oldTypes);
  }

  if (typeof typeToAdd === "string") {
    return oldTypes.add(typeToAdd);
  }

  return new Set([...oldTypes, ...typeToAdd]);
}
