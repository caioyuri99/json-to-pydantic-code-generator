import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";
import { PYTHON_RESERVED_KEYWORDS } from "../consts/PYTHON_RESERVED_KEYWORDS.const";
import { setToTypeAnnotation } from "../functions/setToTypeAnnotation.function";
import { ClassModel } from "../types/ClassModel.type";
import pluralize from "pluralize";

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

// TODO: Fazer alteração para detectar se o nome começa com um número, se sim, prefixar com "Class_"
function getClassName(
  base: string,
  reserved = PYTHON_RESERVED_KEYWORDS
): string {
  const baseName = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s_]/g, "")
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  let candidate = baseName;
  const suffix = "Model";
  let i = 1;

  while (reserved.has(candidate)) {
    if (i > 5) {
      return `${baseName}Model1`;
    }

    candidate = `${baseName}${suffix.slice(0, i)}`;

    i++;
  }

  if (candidate.match(/^[0-9]/)) {
    candidate = `Class_${candidate}`;
  }

  return candidate;
}

function dedent(strings: TemplateStringsArray, ...values: any[]): string {
  const rawString = strings.reduce((result, str, i) => {
    return `${result}${str}${values[i] ?? ""}`;
  }, "");

  const lines = rawString.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim() !== "");

  if (nonEmptyLines.length === 0) {
    return "";
  }

  const indentSize = Math.min(
    // A regex /^\s*/ sempre retorna um resultado válido, mesmo em uma string vazia, porque ela casa com "zero ou mais espaços no início da linha"
    // Então, line.match(/^\s*/) nunca será null
    ...nonEmptyLines.map((line) => line.match(/^\s*/)![0].length)
  );

  return lines
    .map((line) =>
      line.startsWith(" ".repeat(indentSize)) ? line.slice(indentSize) : line
    )
    .join("\n")
    .trim();
}

function serializeClasses(
  classes: ClassModel[]
): { className: string; attributes: { name: string; type: string }[] }[] {
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

function getArrayClassName(attributeName: string): string {
  const singularName = pluralize.singular(attributeName);

  if (attributeName === singularName) {
    return `${attributeName}Item`;
  }

  return singularName;
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

function addType(
  set: TypeSet<string> | ListSet<string>,
  ...values: (string | ListSet<string>)[]
): TypeSet<string> | ListSet<string> {
  for (const value of values) {
    if (value instanceof TypeSet) {
      throw new Error("Add TypeSet is not allowed");
    }

    if (value instanceof ListSet) {
      const alreadyHasListSet = [...set].find((v) => v instanceof ListSet);
      if (alreadyHasListSet) {
        value.forEach((e) => addType(alreadyHasListSet, e));

        continue;
      }
    }

    set.add(value);
  }

  return set;
}

export {
  nonCommonElements,
  getClassName,
  dedent,
  serializeClasses,
  getNonDuplicateName,
  getArrayClassName,
  hasType,
  addType
};
