import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";
import { ClassModel } from "../types/ClassModel.type";
import { nonCommonElements } from "../utils/utils.module";

function setOptional(classes: ClassModel[], classModel: ClassModel) {
  const optionalAttrs = nonCommonElements(
    classes
      .filter((c) => c.className === classModel.className)
      .map((e) => e.attributes.map((a) => a.name))
  );

  for (const attr of classModel.attributes) {
    if (optionalAttrs.includes(attr.name)) {
      if (attr.type instanceof ListSet) {
        attr.type = new TypeSet(["Any", attr.type]);
      } else {
        attr.type.add("Any");
      }
    }
  }
}

export { setOptional };
