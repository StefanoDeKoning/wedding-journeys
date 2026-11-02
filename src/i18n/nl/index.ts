/**
 * All Dutch dictionaries, merged. Each module default-exports an object of
 * English source string → Dutch translation (`satisfies Record<string, string>`
 * so its keys stay literal). Add new modules here; `MessageKey` is derived
 * from the merged object, so `t("…")` with an untranslated string is a type
 * error.
 */
import core from "./core";
import marketing from "./marketing";
import auth from "./auth";
import messages from "./messages";
import guest from "./guest";
import rsvp from "./rsvp";
import guestPages from "./guestPages";
import admin from "./admin";
import adminGuests from "./adminGuests";

export const NL = {
  ...core,
  ...marketing,
  ...auth,
  ...messages,
  ...guest,
  ...rsvp,
  ...guestPages,
  ...admin,
  ...adminGuests,
};

export type MessageKey = keyof typeof NL;
