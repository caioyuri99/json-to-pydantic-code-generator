import { ClassAttribute } from "../types/ClassAttribute.type";
import { ClassModel } from "../types/ClassModel.type";

export function renameEqualNameClasses(
  classModelsOld: ClassModel[],
  classModelsNew: ClassModel[],
  newAttribute: ClassAttribute
): void {
  while (classModelsNew.length > 0) {
    const cls = classModelsNew[0];
  }
}
