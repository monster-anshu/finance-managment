/** @type {import("prettier").Config} */
const config = {
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf",
  htmlWhitespaceSensitivity: "strict",
  insertPragma: false,
  jsxSingleQuote: false,
  organizeImportsSkipDestructiveCodeActions: true,
  plugins: ["prettier-plugin-organize-imports"],
  printWidth: 80,
  quoteProps: "as-needed",
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  useTabs: false,
};

module.exports = config;
