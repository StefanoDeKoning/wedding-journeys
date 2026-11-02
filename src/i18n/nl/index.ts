/**
 * All Dutch dictionaries, merged. Each module default-exports an object of
 * English source string → Dutch translation (`satisfies Record<string, string>`
 * so its keys stay literal). Add new modules here; `MessageKey` is derived
 * from the merged object, so `t("…")` with an untranslated string is a type
 * error.
 */
import core from "./core";
import marketing from "./marketing";

export const NL = {
  ...core,
  ...marketing,
};

export type MessageKey = keyof typeof NL;
