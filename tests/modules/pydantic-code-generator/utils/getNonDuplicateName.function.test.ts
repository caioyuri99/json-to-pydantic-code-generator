import { getNonDuplicateName } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("getNonDuplicateName", () => {
  test("returns the base name if it does not exist", () => {
    expect(getNonDuplicateName("Info", [])).toBe("Info");
  });

  test("appends 1 if the base name exists", () => {
    expect(getNonDuplicateName("Info", ["Info"])).toBe("Info1");
  });

  test("appends the next available number", () => {
    expect(getNonDuplicateName("Info", ["Info", "Info1", "Info2"])).toBe(
      "Info3"
    );
  });

  test("skips numbers that are already used", () => {
    expect(getNonDuplicateName("Data", ["Data", "Data1", "Data3"])).toBe(
      "Data2"
    );
  });

  test("does not match partial overlaps", () => {
    expect(getNonDuplicateName("Info", ["Information", "InfoDetails"])).toBe(
      "Info"
    );
  });

  test("appends 1 if the only match is a case-sensitive one", () => {
    expect(getNonDuplicateName("info", ["Info"])).toBe("info");
  });
});
