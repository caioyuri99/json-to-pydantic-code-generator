import { generateClass } from "./functions/generateClass.function";
import { generateClasses } from "./functions/generateClasses.function";
import { getImports } from "./functions/getImports.function";

function generatePydanticCode(
  json: any,
  name = "Model",
  flags: {
    indentation?: number;
    preferClassReuse?: boolean;
  } = {}
): string {
  const { indentation = 4, preferClassReuse = false } = flags;

  if (indentation < 1) {
    throw new Error("ERROR: Indentation must be greater than 0");
  }

  const generatedClasses = generateClasses(json, name, [], preferClassReuse);
  const classes = generatedClasses
    .map((e) => generateClass(e, indentation))
    .join("\n\n\n");

  const imports = getImports(classes);

  return `${imports}\n\n\n${classes}`;
}

export { generatePydanticCode };
