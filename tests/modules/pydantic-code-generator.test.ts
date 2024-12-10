import { ClassModel } from "../../src/modules/pydantic-code-generator/interfaces/ClassModel.interface";
import {
  generatePydanticCode,
  mergeObjects,
  mergeTypes
} from "../../src/modules/pydantic-code-generator/pydantic-code-generator.module";

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

  describe("mergeTypes", () => {
    test("must return the same type when types are equal", () => {
      expect(mergeTypes("int", "int")).toBe("int");
      expect(mergeTypes("str", "str")).toBe("str");
      expect(mergeTypes("Optional[int]", "Optional[int]")).toBe(
        "Optional[int]"
      );
    });

    test("should return Optional[Type] when one of the types is Any", () => {
      expect(mergeTypes("Any", "int")).toBe("Optional[int]");
      expect(mergeTypes("str", "Any")).toBe("Optional[str]");
      expect(mergeTypes("Optional[Any]", "int")).toBe("Optional[int]");
    });

    test("should return Union[Type1, Type2] when types are different", () => {
      expect(mergeTypes("int", "str")).toBe("Union[int, str]");
      expect(mergeTypes("bool", "float")).toBe("Union[bool, float]");
    });

    test("must handle Optional correctly", () => {
      expect(mergeTypes("Optional[int]", "int")).toBe("Optional[int]");
      expect(mergeTypes("Optional[int]", "Optional[str]")).toBe(
        "Optional[Union[int, str]]"
      );
    });

    test("must handle Union correctly", () => {
      expect(mergeTypes("Union[int, str]", "int")).toBe("Union[int, str]");
      expect(mergeTypes("Union[str, int]", "float")).toBe(
        "Union[float, int, str]"
      );
      expect(mergeTypes("Optional[Union[str, int]]", "int")).toBe(
        "Optional[Union[int, str]]"
      );
    });

    test("must handle combinations of Optional and Union", () => {
      expect(mergeTypes("Optional[int]", "Union[str, int]")).toBe(
        "Optional[Union[int, str]]"
      );
      expect(mergeTypes("Optional[Union[int, str]]", "Optional[float]")).toBe(
        "Optional[Union[float, int, str]]"
      );
    });
  });

  describe("mergeObjects", () => {
    test("empty input", () => {
      const objects: ClassModel[] = [];

      expect(mergeObjects(objects)).toEqual([]);
    });

    test("no duplication", () => {
      const objects: ClassModel[] = [
        { className: "User", attributes: [{ name: "id", type: "int" }] },
        {
          className: "Product",
          attributes: [{ name: "price", type: "float" }]
        }
      ];

      expect(mergeObjects(objects)).toEqual(expect.arrayContaining(objects));
    });

    test("identical classes with different attributes", () => {
      const objects: ClassModel[] = [
        { className: "User", attributes: [{ name: "id", type: "int" }] },
        { className: "User", attributes: [{ name: "email", type: "str" }] }
      ];

      const expected: ClassModel[] = [
        {
          className: "User",
          attributes: [
            { name: "id", type: "Optional[int]" },
            { name: "email", type: "Optional[str]" }
          ]
        }
      ];

      expect(mergeObjects(objects)).toEqual(expect.arrayContaining(expected));
    });

    test("duplicate attributes and conflicting types", () => {
      const objects: ClassModel[] = [
        { className: "User", attributes: [{ name: "id", type: "int" }] },
        { className: "User", attributes: [{ name: "id", type: "str" }] }
      ];

      const expected: ClassModel[] = [
        {
          className: "User",
          attributes: [{ name: "id", type: "Union[int, str]" }]
        }
      ];

      expect(mergeObjects(objects)).toEqual(expect.arrayContaining(expected));
    });

    test("multiple classes with partial merging", () => {
      const objects: ClassModel[] = [
        { className: "User", attributes: [{ name: "id", type: "int" }] },
        { className: "User", attributes: [{ name: "email", type: "str" }] },
        {
          className: "Product",
          attributes: [{ name: "price", type: "float" }]
        }
      ];

      const expected: ClassModel[] = [
        {
          className: "User",
          attributes: [
            { name: "id", type: "Optional[int]" },
            { name: "email", type: "Optional[str]" }
          ]
        },
        {
          className: "Product",
          attributes: [{ name: "price", type: "float" }]
        }
      ];

      expect(mergeObjects(objects)).toEqual(expect.arrayContaining(expected));
    });

    test("multiple levels of duplication", () => {
      const objects: ClassModel[] = [
        { className: "User", attributes: [{ name: "id", type: "int" }] },
        { className: "User", attributes: [{ name: "email", type: "str" }] },
        { className: "User", attributes: [{ name: "email", type: "str" }] },
        { className: "User", attributes: [{ name: "id", type: "int" }] }
      ];

      const expected: ClassModel[] = [
        {
          className: "User",
          attributes: [
            { name: "id", type: "Optional[int]" },
            { name: "email", type: "Optional[str]" }
          ]
        }
      ];

      expect(mergeObjects(objects)).toEqual(expected);
    });
  });
});
