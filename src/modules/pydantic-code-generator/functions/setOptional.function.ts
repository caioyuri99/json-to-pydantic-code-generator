import { TypeSet } from "../classes/TypeSet.class";
import { ClassModel } from "../types/ClassModel.type";
import { uniqueElements } from "../utils/utils.module";

export function setOptional(classes: ClassModel[], classModel: ClassModel) {
  const optionalAttrs = uniqueElements(
    classes
      .filter((c) => c.className === classModel.className)
      .map((e) => e.attributes.map((a) => a.name))
  );

  for (const attr of classModel.attributes) {
    if (optionalAttrs.includes(attr.name)) {
      attr.type.add("Any");
    }
  }
}
