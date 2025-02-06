import { generateClass } from "./functions/generateClass.function";
import { generateClasses } from "./functions/generateClasses.function";
import { getTypingImports } from "./functions/getTypingImports.function";

// TODO: adicionar verificação para nomes de classes para impedir que classes sejam criadas com palavras reservadas/nomes de tipos nativos
export function generatePydanticCode(json: any): string {
  const generatedClasses = generateClasses(json);
  const classes = generatedClasses.map((e) => generateClass(e)).join("\n\n\n");
  const importLines = ["from pydantic import BaseModel"];

  const typingImports = getTypingImports(classes);

  if (typingImports) {
    importLines.push(typingImports);
  }

  return `${importLines.join("\n\n")}\n\n\n${classes}`;
}
