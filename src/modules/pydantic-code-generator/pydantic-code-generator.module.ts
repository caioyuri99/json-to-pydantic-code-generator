import { generateClass } from "./functions/generateClass.function";
import { generateClasses } from "./functions/generateClasses.function";
import { getImports } from "./functions/getImports.function";

function generatePydanticCode(json: any): string {
  const generatedClasses = generateClasses(json);
  const classes = generatedClasses.map((e) => generateClass(e)).join("\n\n\n");

  const imports = getImports(classes);

  return `${imports}\n\n\n${classes}`;
}

export { generatePydanticCode };
