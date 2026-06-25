# Self-hosted fonts

The page expects these woff2 files here (referenced by `@font-face` in `Base.astro`):

- `Neacademia-Display.woff2`, `Neacademia-Display-Italic.woff2` (masthead, headlines, nameplate)
- `Skolar.woff2`, `Skolar-Italic.woff2` (body / reading, variable)
- `SkolarSans.woff2`, `SkolarSans-Italic.woff2` (interface, variable)
- `AdapterMono-*.woff2` (figures) — pending; figures fall back to IBM Plex Mono until added.

## Current state: TRIAL fonts (evaluation only)

The woff2 here are **Rosetta trial fonts**, Latin-subset and converted locally for evaluation.
They are gitignored and must never be committed or deployed: trials are licensed for evaluation
only. Trials also disable a few glyphs as a restriction (Skolar/Skolar Sans render `x`/`X` as a
"removed" box; Neacademia omits `Q q X x`). The licensed fonts render every glyph.

## Before launch

Buy the **Web** licence at `shop.rosettatype.com/buy/<Name>` for the styles in use (Neacademia
Display Rg+It; Skolar Rg+It; Skolar Sans Rg+Md+Sb; Adapter Mono Rg+Md), drop the licensed woff2
in with the same filenames, and remove the `public/fonts/*.woff2` line from `.gitignore`.
