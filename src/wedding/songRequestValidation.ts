export function validateSongRequest(title: string, artist: string, spotify: string) {
  if (!title.trim()) return "Song title is required.";
  if (spotify.trim() && !/^https?:\/\/(open\.)?spotify\.com\//i.test(spotify.trim())) {
    return "Spotify link must start with https://open.spotify.com/";
  }
  return null;
}