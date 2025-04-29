import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";
import { setToTypeAnnotation } from "../functions/setToTypeAnnotation.function";
import { ClassModel } from "../types/ClassModel.type";

function nonCommonElements<T>(lists: T[][]): T[] {
  const allElements = new Set(lists.flat());

  const frequency = new Map<T, number>();
  allElements.forEach((element) => {
    const count = lists.reduce(
      (acc, list) => acc + (list.includes(element) ? 1 : 0),
      0
    );
    frequency.set(element, count);
  });

  return Array.from(frequency.entries())
    .filter(([_, count]) => count < lists.length)
    .map(([element, _]) => element);
}

// TODO: adicionar verificação para nomes de classes para impedir que classes sejam criadas com palavras reservadas/nomes de tipos nativos
function getClassName(base: string): string {
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s_]/g, "")
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function dedent(strings: TemplateStringsArray, ...values: any[]): string {
  const rawString = strings.reduce((result, str, i) => {
    return `${result}${str}${values || ""}`;
  }, "");

  const lines = rawString.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim() !== "");

  if (nonEmptyLines.length === 0) {
    return "";
  }

  const indentSize = Math.min(
    ...nonEmptyLines.map((line) => line.match(/^\s*/)?.[0].length || 0)
  );

  return lines
    .map((line) =>
      line.startsWith(" ".repeat(indentSize)) ? line.slice(indentSize) : line
    )
    .join("\n")
    .trim();
}

function serializeClasses(classes: ClassModel[]): any[] {
  return classes.map((cls) => ({
    className: cls.className,
    attributes: cls.attributes.map((attr) => ({
      name: attr.name,
      type: setToTypeAnnotation(attr.type)
    }))
  }));
}

function getNonDuplicateName(newName: string, existentNames: string[]): string {
  let posfix = 1;
  let renamedName = newName;
  while (existentNames.includes(renamedName)) {
    renamedName = `${newName}${posfix}`;
    posfix++;
  }

  return renamedName;
}

// TODO: adicionar funcionalidade de identificar plural no nome de atributos que contenham arrays de OBJETOS para que a classe dos objetos do array seja nomeada com o singular do nome do atributo (ex: attribute: "users" -> className: "User"; attribute: "feet" -> className: "Foot")
function getArrayClassName(className: string): string {
  return `${className}Item`;
}

function hasType(
  set: TypeSet<string> | ListSet<string>,
  value: string
): boolean {
  for (const type of set) {
    if (type instanceof ListSet) {
      if (hasType(type, value)) {
        return true;
      }
    } else if (type === value) {
      return true;
    }
  }

  return false;
}

export {
  nonCommonElements,
  getClassName,
  dedent,
  serializeClasses,
  getNonDuplicateName,
  getArrayClassName,
  hasType
};
