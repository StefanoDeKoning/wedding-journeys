import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { validateSongRequest } from "./songRequestValidation";

describe("song request fields", () => {
  test("a title is required even when other fields are filled", () => {
    assert.equal(validateSongRequest("   ", "Etta James", "https://open.spotify.com/track/123"), "Song title is required.");
  });
  test("artist is optional", () => {
    assert.equal(validateSongRequest("At Last", "", "https://open.spotify.com/track/123"), null);
  });
  test("Spotify link is optional", () => {
    assert.equal(validateSongRequest("At Last", "Etta James", ""), null);
    assert.equal(validateSongRequest("At Last", "", ""), null);
  });
  test("a supplied Spotify link still must be valid", () => {
    assert.equal(validateSongRequest("At Last", "", "invalid"), "Spotify link must start with https://open.spotify.com/");
  });
});