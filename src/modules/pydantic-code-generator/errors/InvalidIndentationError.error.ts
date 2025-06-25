class InvalidIndentationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidIndentationError";
  }
}

export { InvalidIndentationError };
