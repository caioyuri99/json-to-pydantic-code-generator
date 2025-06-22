import { hasOwnProperties } from "../utils/utils.module.js";

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

    case "object":
      if (value !== null && !hasOwnProperties(value)) {
        return "Dict[str, Any]";
      }

    default:
      return "Any";
  }
}

export { getType };
