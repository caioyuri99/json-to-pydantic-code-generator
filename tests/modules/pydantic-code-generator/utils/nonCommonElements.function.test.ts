import { nonCommonElements } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("nonCommonElements", () => {
  it("should include elements not present in all lists (numbers)", () => {
    const lists = [
      [1, 2, 3],
      [3, 4, 5],
      [5, 6]
    ];

    const result = nonCommonElements(lists);
    // Nenhum número aparece em todas as listas, então todos entram
    expect(result.sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("should include elements not present in all lists (strings)", () => {
    const lists = [
      ["a", "b", "c"],
      ["c", "d", "e"],
      ["e", "f"]
    ];

    const result = nonCommonElements(lists);
    expect(result.sort()).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("should return empty when no elements are provided", () => {
    const lists: number[][] = [];

    const result = nonCommonElements(lists);
    expect(result).toEqual([]);
  });

  it("should handle lists with empty arrays", () => {
    const lists = [[], [1, 2], [], [2, 3]];

    const result = nonCommonElements(lists);
    expect(result.sort()).toEqual([1, 2, 3]);
  });

  it("should correctly exclude elements present in all lists", () => {
    const lists = [
      [1, 2, 3],
      [2, 3, 4],
      [2, 3, 5]
    ];

    const result = nonCommonElements(lists);
    // 2 e 3 estão em todas? Sim.
    // Resultado: apenas os que NÃO estão em todas => 1, 4, 5
    expect(result.sort()).toEqual([1, 4, 5]);
  });

  it("should work with arrays of objects (reference equality)", () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    const obj3 = obj1;

    const lists = [[obj1], [obj2, obj3]];

    const result = nonCommonElements(lists);
    // obj1 === obj3, então obj1 está em todas
    // Só obj2 deveria aparecer
    expect(result).toEqual([obj2]);
  });

  it("should return empty if all elements are common", () => {
    const lists = [
      [1, 2],
      [1, 2],
      [1, 2]
    ];

    const result = nonCommonElements(lists);
    expect(result).toEqual([]);
  });

  it("should preserve first occurrence order", () => {
    const lists = [
      [3, 2, 1],
      [4, 6, 5]
    ];

    const result = nonCommonElements(lists);
    // Nenhum elemento aparece em todas, então todos entram
    expect(result).toEqual([3, 2, 1, 4, 6, 5]);
  });
});
