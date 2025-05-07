import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";

type ClassAttribute = {
  name: string;
  type: TypeSet<string> | ListSet<string>;
  alias?: string;
};

export { ClassAttribute };
