import { ListSet } from "../classes/ListSet.class.js";
import { TypeSet } from "../classes/TypeSet.class.js";

type ClassAttribute = {
  name: string;
  type: TypeSet<string> | ListSet<string>;
  alias?: string;
};

export { ClassAttribute };
