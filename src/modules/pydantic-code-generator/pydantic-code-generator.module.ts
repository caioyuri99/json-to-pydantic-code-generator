import { ListSet } from "./classes/ListSet.class.js";
import { TypeSet } from "./classes/TypeSet.class.js";
import { InvalidIndentationError } from "./errors/InvalidIndentationError.error.js";
import { InvalidJSONString } from "./errors/InvalidJSONStringError.error.js";
import { generateClass } from "./functions/generateClass.function.js";
import { generateClasses } from "./functions/generateClasses.function.js";
import { getImports } from "./functions/getImports.function.js";
import { ClassAttribute } from "./types/ClassAttribute.type.js";

function addAny(attr: ClassAttribute): void {
  if (attr.type instanceof ListSet) {
    attr.type = new TypeSet([attr.type]);
  }

  attr.type.add("Any");
}

/**
 * Generates Python Pydantic code from a JSON object.
 * Allows customization of class name, indentation, tab usage, aliases, and optional attribute handling.
 *
 * @param json Input object (or object array) or stringfied JSON.
 * @param name Root class name (default: "Model").
 * @param flags Generation options:
 *   - indentation: Number of spaces for indentation (default: 4). NOTE: the tab size is defined by the environment in which the string is displayed, i.e. this flag has no effect when "useTabs" is "true".
 *   - preferClassReuse: Reuse identical class definitions (default: false).
 *   - forceOptional: Make attributes optional ("None", "OnlyRootClass", "AllClasses").
 *   - aliasCamelCase: Use camelCase aliases for fields (default: false).
 *   - useTabs: Use tabs instead of spaces for indentation (default: false).
 * @returns Python Pydantic code as a string.
// TODO: criar classes de erro
 * @throws {InvalidIndentationError} If indentation is less than 1.
 * @throws {InvalidJSONString} If the input string is not a valid JSON.
 * @throws {MalformedJSONError} If the input is not a valid JSON object or array.
 */
function generatePydanticCode(
  json: string | object | object[],
  name = "Model",
  flags: {
    indentation?: number;
    preferClassReuse?: boolean;
    forceOptional?: "None" | "OnlyRootClass" | "AllClasses";
    aliasCamelCase?: boolean;
    useTabs?: boolean;
  } = {}
): string {
  const {
    indentation = 4,
    preferClassReuse = false,
    forceOptional = "None",
    aliasCamelCase = false,
    useTabs = false
  } = flags;

  if (indentation < 1) {
    throw new InvalidIndentationError("Indentation must be greater than 0");
  }
  if (typeof json === "string") {
    try {
      json = JSON.parse(json);
    } catch (error) {
      throw new InvalidJSONString("The input string is not a valid JSON");
    }
  }

  const generatedClasses = generateClasses(json, name, [], preferClassReuse);

  if (forceOptional === "OnlyRootClass") {
    generatedClasses.at(-1)?.attributes.map((attr) => addAny(attr));
  }

  if (forceOptional === "AllClasses") {
    generatedClasses.map((c) => c.attributes.map((attr) => addAny(attr)));
  }

  const classes = generatedClasses
    .map((e) => generateClass(e, indentation, aliasCamelCase, useTabs))
    .join("\n\n\n");

  const imports = getImports(classes);

  return `from __future__ import annotations\n\n${imports}\n\n\n${classes}`;
}

export { generatePydanticCode };
