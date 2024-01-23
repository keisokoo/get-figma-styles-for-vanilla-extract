export type WordCaseType =
  | "PascalCase"
  | "camelCase"
  | "snake_case"
  | "original";

const specialCharacterRegExp =
  /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
const specialCharacterRegExpWithoutUnderBar =
  /[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/g;
function checkValidText(txt: string) {
  if (!isNaN(Number(txt.charAt(0)))) {
    txt = `_${txt}`;
    return checkValidText(txt);
  } else if (specialCharacterRegExp.test(txt.charAt(0))) {
    txt = txt.slice(1, txt.length);
    return checkValidText(txt);
  }
  if (txt.includes("-")) {
    txt = txt.replace(/-/g, " ");
  }
  if (specialCharacterRegExpWithoutUnderBar.test(txt)) {
    txt = txt.replace(specialCharacterRegExpWithoutUnderBar, "");
  }
  return txt;
}

export function firstLetterToUpperCase(txt: string) {
  return txt.charAt(0).toUpperCase() + txt.substring(1);
}
export function firstLetterToLowerCase(txt: string) {
  return txt.charAt(0).toLocaleLowerCase() + txt.substring(1);
}
export function WhiteSpaceToPascalCase(text: string) {
  return checkValidText(text)
    .replace(/\w+/g, firstLetterToUpperCase)
    .replace(/\s/g, "");
}
export function whiteSpaceToCamelCase(text: string) {
  return firstLetterToLowerCase(
    checkValidText(text)
      .replace(/\w+/g, firstLetterToUpperCase)
      .replace(/\s/g, "")
  );
}
export function white_space_to_snake_case(text: string) {
  return checkValidText(text)
    .replace(/\w+/g, firstLetterToLowerCase)
    .replace(/\s/g, "_");
}
const handleWhiteSpaceWordCase = new Map<
  WordCaseType,
  (text: string) => string
>([
  ["PascalCase", WhiteSpaceToPascalCase],
  ["camelCase", whiteSpaceToCamelCase],
  ["snake_case", white_space_to_snake_case],
  ["original", (value) => value],
]);
export function splitWithWordCase(text: string, splitWord: string): string[] {
  if (!text.includes(splitWord)) return [text];
  return text.split(splitWord).map((text) => text);
}
export function disposeWhiteSpace(text: string) {
  return text;
}
