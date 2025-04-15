import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";

export type ClassAttribute = {
  name: string;
  type: TypeSet<string> | ListSet<string>;
};
