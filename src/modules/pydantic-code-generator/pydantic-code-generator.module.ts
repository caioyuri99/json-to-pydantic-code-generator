import { generateClass } from "./functions/generateClass.function";
import { generateClasses } from "./functions/generateClasses.function";
import { getTypingImports } from "./functions/getTypingImports.function";

// TODO: adicionar verificação para nomes de classes para impedir que classes sejam criadas com palavras reservadas/nomes de tipos nativos
// TODO: adicionar funcionalidade de identificar plural no nome de atributos que contenham arrays de OBJETOS para que a classe dos objetos do array seja nomeada com o singular do nome do atributo (ex: attribute: "users" -> className: "User"; attribute: "feet" -> className: "Foot")
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
