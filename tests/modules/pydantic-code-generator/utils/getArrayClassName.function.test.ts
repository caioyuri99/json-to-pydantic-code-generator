import { getArrayClassName } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("getArrayClassName", () => {
  test("returns singular form if attribute name is a regular plural", () => {
    expect(getArrayClassName("Users")).toBe("User");
    expect(getArrayClassName("Cars")).toBe("Car");
    expect(getArrayClassName("Books")).toBe("Book");
    expect(getArrayClassName("Details")).toBe("Detail");
  });

  test("returns singular form for irregular plurals", () => {
    expect(getArrayClassName("Feet")).toBe("Foot");
    expect(getArrayClassName("Teeth")).toBe("Tooth");
    expect(getArrayClassName("Children")).toBe("Child");
    expect(getArrayClassName("People")).toBe("Person");
    expect(getArrayClassName("Geese")).toBe("Goose");
    expect(getArrayClassName("Data")).toBe("Datum");
  });

  test("returns fallback with 'Item' when singularization has no effect", () => {
    expect(getArrayClassName("News")).toBe("NewsItem");
    expect(getArrayClassName("Equipment")).toBe("EquipmentItem");
    expect(getArrayClassName("User")).toBe("UserItem");
    expect(getArrayClassName("Car")).toBe("CarItem");
  });
});
