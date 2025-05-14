import { getClassName } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("getClassName", () => {
  test("should convert lowercase words to PascalCase", () => {
    expect(getClassName("user")).toBe("User");
  });

  test("should convert snake_case to PascalCase", () => {
    expect(getClassName("user_profile")).toBe("UserProfile");
  });

  test("should convert space-separated words to PascalCase", () => {
    expect(getClassName("user profile")).toBe("UserProfile");
  });

  test("should normalize and remove accents", () => {
    expect(getClassName("usuário_fiél")).toBe("UsuarioFiel");
  });

  test("should remove non-alphanumeric characters", () => {
    expect(getClassName("user@#%_profile!!")).toBe("UserProfile");
  });

  test("should handle mixed spaces, underscores, and symbols", () => {
    expect(getClassName("___usuário @ perfil__123!!")).toBe("UsuarioPerfil123");
  });

  test("should handle mixed UPPERCASE and symbols", () => {
    expect(getClassName("CLIENTE#VIP")).toBe("CLIENTEVIP");
  });

  test("should handle mixed accents, underscores and UPPERCASE", () => {
    expect(getClassName("dado_PÚBLICO")).toBe("DadoPUBLICO");
  });

  test("should handle strings with numbers", () => {
    expect(getClassName("user_123_name")).toBe("User123Name");
  });

  test("should return empty string for input with no valid characters", () => {
    expect(getClassName("@#$%")).toBe("");
  });

  test("should handle already PascalCase names", () => {
    expect(getClassName("UserProfile")).toBe("UserProfile");
  });

  test("should handle UPPERCASE", () => {
    expect(getClassName("TEST")).toBe("TEST");
  });

  test("should handle mixed UPPERCASE, accents and PascalCase", () => {
    expect(getClassName("user-INFO_01")).toBe("UserINFO01");
  });

  test("adds characters from 'model' to reserved Python keywords until no conflict", () => {
    expect(getClassName("true")).toBe("TrueM");
    expect(getClassName("false")).toBe("FalseM");
    expect(getClassName("none")).toBe("NoneM");
    expect(getClassName("from")).toBe("From");
  });

  test("adds more than one character from 'model' if needed", () => {
    const fakeReserved = new Set([
      "True",
      "TrueM",
      "TrueMo",
      "TrueMod",
      "TrueMode"
    ]);

    expect(getClassName("True", fakeReserved)).toBe("TrueModel");

    fakeReserved.add("TrueModel");

    expect(getClassName("true", fakeReserved)).toBe("TrueModel1");
  });

  test("prefixes class name with 'Class_' if it starts with a number", () => {
    expect(getClassName("123model")).toBe("Class_123model");
    expect(getClassName("9user")).toBe("Class_9user");
    expect(getClassName("42_data")).toBe("Class_42Data");
  });

  test("does not prefix 'Class_' if the name does not start with a number", () => {
    expect(getClassName("user1")).toBe("User1");
    expect(getClassName("data2025")).toBe("Data2025");
  });

  test("prefixes 'Class_' even after PascalCase conversion if it still starts with a number", () => {
    expect(getClassName("123_user")).toBe("Class_123User");
  });
});
