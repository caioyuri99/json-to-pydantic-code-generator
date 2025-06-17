import { ListSet } from "./classes/ListSet.class";
import { TypeSet } from "./classes/TypeSet.class";
import { generateClass } from "./functions/generateClass.function";
import { generateClasses } from "./functions/generateClasses.function";
import { getImports } from "./functions/getImports.function";
import { ClassAttribute } from "./types/ClassAttribute.type";

function addAny(attr: ClassAttribute): void {
  if (attr.type instanceof ListSet) {
    attr.type = new TypeSet([attr.type]);
  }

  attr.type.add("Any");
}

function generatePydanticCode(
  json: any,
  name = "Model",
  flags: {
    indentation?: number;
    preferClassReuse?: boolean;
    forceOptional?: "None" | "OnlyRootClass" | "AllClasses";
    aliasCamelCase?: boolean;
  } = {}
): string {
  const {
    indentation = 4,
    preferClassReuse = false,
    forceOptional = "None",
    aliasCamelCase = false
  } = flags;

  if (indentation < 1) {
    throw new Error("ERROR: Indentation must be greater than 0");
  }

  const generatedClasses = generateClasses(json, name, [], preferClassReuse);

  if (forceOptional === "OnlyRootClass") {
    generatedClasses.at(-1)?.attributes.map((attr) => addAny(attr));
  }

  if (forceOptional === "AllClasses") {
    generatedClasses.map((c) => c.attributes.map((attr) => addAny(attr)));
  }

  const classes = generatedClasses
    .map((e) => generateClass(e, indentation, aliasCamelCase))
    .join("\n\n\n");

  const imports = getImports(classes);

  return `from __future__ import annotations\n\n${imports}\n\n\n${classes}`;
}

export { generatePydanticCode };
