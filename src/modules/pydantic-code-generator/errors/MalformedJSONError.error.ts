class MalformedJSONError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedJSONError";
  }
}

export { MalformedJSONError };
