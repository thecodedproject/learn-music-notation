# Stave: learn to read music

A web app for learning to read and write music notation in short lessons, built the same way
as [learn-morse-code](https://github.com/thecodedproject/learn-morse-code): chapters of lessons,
each a dozen generated exercises that get harder as they go, then a chapter test (80% to pass).
Everything is open from the start, and progress is kept in the browser.

## Exercises

- **Read notes**: name the notes on the stave by tapping letter keys (C to B, or Do to Ti with
  solfège on in settings). The octave doesn't matter; sharps and flats do once they're taught.
- **Write notes**: put named notes on the stave. Press in a slot and drag up or down to choose
  the line or space, then nudge with ▲▼, add ♯/♭, or type letters and arrows on a keyboard.
- **Intervals**: name the interval between two notes (2nd, 3rd... then m3, P5...), or write the
  note an interval above or below one given.
- **Key signatures**: name the major key a key signature is for.
- **Hear a scale**: the first note is shown, a major scale is played up from it (from any degree
  in later lessons), and you name the key.
- **Dictation**: the first note is shown and played, then more notes are. Write them on the stave.
  Harder lessons add more notes, wider leaps, and leave the key signature out.

## The course

Chapters live in `src/course/`, one file each, as data: the notes each lesson teaches (by clef,
written `"E4 G4 F#5"`), the mix of exercise kinds and how hard each is. `src/lib/lesson_gen.ts`
turns a lesson into exercises.

1. Treble clef: lines
2. Treble clef: spaces
3. Steps and skips (first intervals, first notes by ear)
4. Beyond the treble stave (ledger lines, 4ths, 5ths, octaves)
5. Bass clef
6. Both clefs
7. Sharps and flats
8. Key signatures (and hearing scales)
9. Major, minor and perfect intervals (and longer dictation)

Still to come: rhythm and note lengths (an entry toolbar for durations and rests), minor keys and
modes, triads and chord symbols, melody fragments from Bach, seventh chords, and solfège.

## Music theory, the stave and sound

All come from [music-lib](https://github.com/thecodedproject/music-lib), shared with
chord_almanac, installed from a tag of its repo (`github:thecodedproject/music-lib#v0.1.1`). To work on the library alongside the app, point
`package.json` at a local checkout with `"music-lib": "link:../music-lib"` (and run `yarn build`
in the library after changing it); remember to switch back, and bump the tag, before pushing.

## Building

```
yarn install
yarn test
yarn start      # builds and serves dist/ on http://localhost:8080
```

`yarn build:prod` makes the production build, which `.github/workflows/pages.yml` deploys to
GitHub Pages on every push to `main`. `public/` (manifest, icons, offline service worker) is
copied into `dist/` as it is. The icons still need redrawing for this app (`scripts/make_icons.py`).
