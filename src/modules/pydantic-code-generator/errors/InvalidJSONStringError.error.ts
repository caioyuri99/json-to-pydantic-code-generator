class InvalidJSONString extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidJSONStringError";
  }
}

export { InvalidJSONString };
