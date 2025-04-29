import { dedent } from "../../../../src/modules/pydantic-code-generator/utils/utils.module";

describe("dedent", () => {
  test("preserves variable interpolation", () => {
    const name = "Ana";
    const age = 30;
    const result = dedent`
      Name: ${name}
      Age: ${age}
    `;
    expect(result).toBe("Name: Ana\nAge: 30");
  });

  test("removes indentation from text", () => {
    const result = dedent`
      Name: Ana
      Age: 30
    `;
    expect(result).toBe("Name: Ana\nAge: 30");
  });

  test("removes indentation with extra spaces at the end", () => {
    const result = dedent`
        Name: Ana
        Age: 30   
    `;
    expect(result).toBe("Name: Ana\nAge: 30");
  });

  test("removes indentation from text with multiple empty lines at the beginning and end", () => {
    const result = dedent`
        
      Name: Ana
      
      Age: 30
        
    `;
    expect(result).toBe("Name: Ana\n\nAge: 30");
  });

  test("does not alter content if no indentation is present", () => {
    const result = dedent`Hello world`;
    expect(result).toBe("Hello world");
  });

  test("returns an empty string for an empty input", () => {
    const result = dedent``;
    expect(result).toBe("");
  });
});
