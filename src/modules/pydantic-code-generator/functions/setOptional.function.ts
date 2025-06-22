import { ListSet } from "../classes/ListSet.class.js";
import { TypeSet } from "../classes/TypeSet.class.js";
import { ClassModel } from "../types/ClassModel.type.js";
import { addType, nonCommonElements } from "../utils/utils.module.js";

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
        addType(attr.type, "Any");
      }
    }
  }
}

export { setOptional };
