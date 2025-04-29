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
});
