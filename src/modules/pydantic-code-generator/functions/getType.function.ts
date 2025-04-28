function getType(value: any): string {
  switch (typeof value) {
    case "string":
      return "str";

    case "number":
      if (Number.isInteger(value)) {
        return "int";
      }

      return "float";

    case "boolean":
      return "bool";

    default:
      return "Any";
  }
}

export { getType };
