import { ListSet } from "../../../../src/modules/pydantic-code-generator/classes/ListSet.class";
import { TypeSet } from "../../../../src/modules/pydantic-code-generator/classes/TypeSet.class";
import { renameEqualNameClasses } from "../../../../src/modules/pydantic-code-generator/functions/renameEqualNameClasses.function";

describe("renameEqualNameClasses", () => {
  test("should do nothing if there are no conflicting class names", () => {
    const oldModels = [{ className: "User", attributes: [] }];
    const newModels = [{ className: "Address", attributes: [] }];
    const newAttr = { name: "address", type: new TypeSet(["Address"]) };

    renameEqualNameClasses(oldModels, newModels, newAttr);

    expect(newModels[0].className).toBe("Address");
    expect(newAttr.type).toEqual(new TypeSet(["Address"]));
  });

  test("should rename class with duplicate name", () => {
    const oldClasses = [{ className: "Item", attributes: [] }];
    const newClasses = [{ className: "Item", attributes: [] }];
    const newAttr = { name: "item", type: new TypeSet(["Item"]) };

    renameEqualNameClasses(oldClasses, newClasses, newAttr);

    expect(newClasses[0].className).toBe("Item1");
    expect(newAttr.type).toEqual(new TypeSet(["Item1"]));
  });

  test("should rename multiple classes with duplicate names", () => {
    const oldClasses = [{ className: "Item", attributes: [] }];
    const newClasses = [
      { className: "Item", attributes: [] },
      { className: "Item", attributes: [] },
      { className: "Item", attributes: [] }
    ];
    const newAttr = { name: "items", type: new TypeSet(["Item"]) };

    renameEqualNameClasses(oldClasses, newClasses, newAttr);

    expect(newClasses[0].className).toBe("Item1");
    expect(newClasses[1].className).toBe("Item2");
    expect(newClasses[2].className).toBe("Item3");
    expect(newAttr.type).toEqual(new TypeSet(["Item3"]));
  });

  test("should find next available name if name with suffix already exists", () => {
    const oldClasses = [
      { className: "Item", attributes: [] },
      { className: "Item1", attributes: [] }
    ];
    const newClasses = [
      { className: "Item", attributes: [] },
      { className: "Item", attributes: [] }
    ];
    const newAttr = { name: "data", type: new TypeSet(["Item"]) };

    renameEqualNameClasses(oldClasses, newClasses, newAttr);

    expect(newClasses[0].className).toBe("Item2");
    expect(newClasses[1].className).toBe("Item3");
    expect(newAttr.type).toEqual(new TypeSet(["Item3"]));
  });

  test("should update attribute types inside classModelsNew when renaming", () => {
    const oldClasses = [{ className: "Node", attributes: [] }];
    const newClasses = [
      {
        className: "Node",
        attributes: [{ name: "child", type: new TypeSet(["Node"]) }]
      }
    ];
    const newAttr = { name: "root", type: new TypeSet(["Node"]) };

    renameEqualNameClasses(oldClasses, newClasses, newAttr);

    expect(newClasses[0].className).toBe("Node1");
    expect(newClasses[0].attributes[0].type).toBe("Node1");
    expect(newAttr.type).toEqual(new TypeSet(["Node1"]));
  });

  test("should rename class inside ListSet", () => {
    const oldModels = [{ className: "Item", attributes: [] }];
    const newModels = [{ className: "Item", attributes: [] }];
    const attr = {
      name: "items",
      type: new ListSet(["Item"])
    };

    renameEqualNameClasses(oldModels, newModels, attr);

    expect(newModels[0].className).toBe("Item1");
    expect(attr.type).toEqual(new ListSet<string>(["Item1"]));
  });

  test("should rename class inside ListSet inside TypeSet", () => {
    const oldModels = [{ className: "Detail", attributes: [] }];
    const newModels = [{ className: "Detail", attributes: [] }];
    const innerList = new ListSet<string>(["Detail"]);
    const attr = {
      name: "nested",
      type: new TypeSet([innerList])
    };

    renameEqualNameClasses(oldModels, newModels, attr);

    expect(newModels[0].className).toBe("Detail2");
    expect(attr.type).toEqual(new TypeSet([new ListSet<string>(["Detail2"])]));
  });
});
