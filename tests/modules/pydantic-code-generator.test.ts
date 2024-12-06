import { generatePydanticCode } from "../../src/modules/pydantic-code-generator.module";

describe("pydantic-code-generator", () => {
  describe("generatePydanticCode", () => {
    test("should generate pydantic code", () => {
      const json = {
        name: "John",
        age: 20,
        address: {
          city: "New York",
          street: "Wall Street"
        }
      };
      const expected = `from pydantic import BaseModel


class Address(BaseModel):
  city: str
  street: str


class Model(BaseModel):
  name: str
  age: int
  address: Address`;

      const result = generatePydanticCode(json);

      expect(result).toBe(expected);
    });

    test("should generate Sort, Content, Sort1, Pageable and Model classes", () => {
      const json = {
        content: [
          {
            id: 1,
            sort: {
              direction: "ASC"
            }
          }
        ],
        pageable: {
          sort: {
            sorted: false
          }
        },
        sort: {
          sorted: false
        }
      };

      const expected = `from pydantic import BaseModel

from typing import List


class Sort(BaseModel):
  direction: str


class Content(BaseModel):
  id: int
  sort: Sort


class Sort1(BaseModel):
  sorted: bool


class Pageable(BaseModel):
  sort: Sort1


class Model(BaseModel):
  content: List[Content]
  pageable: Pageable
  sort: Sort1`;

      const result = generatePydanticCode(json);

      expect(result).toBe(expected);
    });

    test("should generate Sort, Content, Sort1, Pageable and Model classes (with arrays)", () => {
      const json = {
        content: [
          {
            id: 1,
            sort: [
              {
                direction: "ASC"
              }
            ]
          }
        ],
        pageable: [
          {
            sort: [
              {
                sorted: false
              }
            ]
          }
        ],
        sort: [
          {
            sorted: false
          }
        ]
      };

      const expected = `from pydantic import BaseModel

from typing import List


class Sort(BaseModel):
  direction: str


class Content(BaseModel):
  id: int
  sort: List[Sort]


class Sort1(BaseModel):
  sorted: bool


class Pageable(BaseModel):
  sort: List[Sort1]


class Model(BaseModel):
  content: List[Content]
  pageable: List[Pageable]
  sort: List[Sort1]`;

      const result = generatePydanticCode(json);

      expect(result).toBe(expected);
    });
  });
});
