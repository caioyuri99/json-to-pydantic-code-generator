import { ClassAttribute } from "../types/ClassAttribute.type.js";
import { ClassModel } from "../types/ClassModel.type.js";
import { equalTypes, hasType, replaceType } from "../utils/utils.module.js";

function reuseClasses(
  oldClasses: ClassModel[],
  newClasses: ClassModel[],
  newAttribute?: ClassAttribute
): void {
  while (newClasses.length > 0) {
    const newClass = newClasses.shift();

    if (newClass) {
      const coincidentalClass = oldClasses.find(
        (e) =>
          e.attributes.length === newClass.attributes.length &&
          e.attributes.every((el) =>
            newClass.attributes.some(
              (ele) => ele.name === el.name && equalTypes(ele.type, el.type)
            )
          )
      );

      if (coincidentalClass) {
        // altera tipos dentro das classes restantes
        for (const classModel of newClasses) {
          classModel.attributes.map((e) => {
            if (hasType(e.type, newClass.className)) {
              replaceType(
                e.type,
                newClass.className,
                coincidentalClass.className
              );
            }
          });
        }

        // se "newAttribute" é passado, altera tipo do novo atributo
        if (newAttribute) {
          replaceType(
            newAttribute.type,
            newClass.className,
            coincidentalClass.className
          );
        }
      } else {
        oldClasses.push(newClass);
      }
    }
  }
}

export { reuseClasses };
