import { getArrayClassName } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("getArrayClassName", () => {
  test("adds 'Item' to a simple class name", () => {
    expect(getArrayClassName("Product")).toBe("ProductItem");
  });

  test("works with class names that already include 'List'", () => {
    expect(getArrayClassName("UserList")).toBe("UserListItem");
  });

  test("works with empty string", () => {
    expect(getArrayClassName("")).toBe("Item");
  });

  test("preserves casing", () => {
    expect(getArrayClassName("user")).toBe("userItem");
    expect(getArrayClassName("USER")).toBe("USERItem");
  });

  test("works with names that include spaces", () => {
    expect(getArrayClassName("My Class")).toBe("My ClassItem");
  });
});
