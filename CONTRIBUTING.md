# Contributing to MusicVenture

Thanks for your interest in MusicVenture! This is a fan-made, non-profit project, and it grows with the help of people who love music. You don't need to be a programmer to contribute: suggesting songs and reporting problems helps a lot.

## Ways to help

- **Suggest songs** for any of the three tiers.
- **Report songs with broken audio** or the wrong version.
- **Test the game** on different browsers and devices and report bugs.
- **Translate** the interface.
- **Design original artwork** (logo, mascot, visual style).
- **Write code** for open issues, especially those tagged `good first issue`.

If you're not sure where to start, open an issue and ask.

## Suggesting songs

Open an issue with the title and artist, plus the tier you think it belongs to. If you're editing the song list directly, use one line per song:

```
Title|Artist
Title|Artist|https://music.apple.com/...
```

The optional third field is an Apple Music link (or a search text) used only to help the game find the right audio preview.

### Which tier?

The game is built around how recognizable a song is, not how famous the artist is. The same artist can appear in all three tiers.

| Tier | Levels | What belongs here |
|------|--------|-------------------|
| Easy | 1-5 | Huge hits that most people recognize in seconds, usually with the title in the chorus. |
| Medium | 6-10 | Well-known artists or songs that are less obvious: second-tier hits, popular album tracks. |
| Iceberg | 11+ | Deep cuts, B-sides, album tracks, niche scenes and genres, older or international songs, and obscure songs by very famous artists. |

Deep cuts from big artists are very welcome in the iceberg, for example a lesser-known Beatles or Madonna song.

### Before you suggest a song

- **Check it isn't already in the list**, including with slightly different spelling or punctuation.
- **Avoid repeated titles.** The game shows only the title, so two different songs with the same name (by different artists) can look identical as options. If a title already exists, mention it in your suggestion.
- **Use the official title and artist name** as they appear in Apple Music / iTunes, without remix or live tags unless that's the version you mean.
- **Keep it appropriate.** Please don't suggest songs whose titles contain slurs or hateful language, since titles are displayed on screen.
- **Don't share links to pirated or unofficial audio.** The game doesn't host any audio; previews come from the iTunes Search API.

## Reporting audio problems

Open an issue with:

- The song and artist.
- The level or tier where it appeared.
- What happened (no sound, wrong version, wrong song, stuck loading).
- Your browser and country, if you know it. Availability can depend on the iTunes store.

If you find an Apple Music link of the correct version, include it. It can be added as the optional third field in the song list.

## Reporting bugs

Open an issue describing:

- What you expected and what happened.
- Steps to reproduce it.
- Your browser, operating system and device.
- A screenshot if it's a visual problem.

## Contributing code

1. Fork the repository and create a branch for your change.
2. Keep the settings (time, error limits, seconds per stretch, iTunes stores) at the top of the code, so they stay easy to adjust.
3. Test your change in the browser by playing at least one full game.
4. Open a pull request describing what you changed and why. For big changes, open an issue first so we can talk about it.

Please don't add heavy dependencies without discussing it first, and don't commit audio files or any assets you don't have the right to share.

## Artwork and assets

All artwork in this project is original. Please only submit your own work, or work you have permission to share, and don't use assets from the original *Music Challenge* or from any other game, brand or franchise.

## Be kind

This is a friendly project. Be respectful in issues and pull requests, and assume good intentions. Disagreements about which tier a song belongs to are normal and fun, so keep them constructive.

## Review process

Suggestions and pull requests are reviewed by the maintainer. Song suggestions may be adjusted (tier, spelling, duplicates) before they're added. Not every suggestion will be accepted, but every one is appreciated.

## License

By contributing, you agree that your contributions will be released under the same license as the project.
