export const isNumOrEmpty = (input: string) =>
  /^\d+$/.test(input) ||
  // also allow empty string
  !input;
