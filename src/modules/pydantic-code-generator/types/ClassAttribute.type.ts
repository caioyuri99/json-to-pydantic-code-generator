import { ListSet } from "../classes/ListSet.class";
import { TypeSet } from "../classes/TypeSet.class";

export type ClassAttribute = {
  name: string;
  type: string | TypeSet<string> | ListSet<string>;
};
