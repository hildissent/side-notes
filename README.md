# Side Notes

An Obsidian plugin that renders margin side notes in both **Live Preview** and **Reading View**.

> **Warning:** This plugin was created for personal use and is not actively maintained or supported. The bulk of the code was written by AI (Claude by Anthropic). Use at your own risk.

## Usage

Wrap any text in `%%> ... %%` to render it as a side note in the left margin:

```
This is a paragraph. %%> This appears as a margin note. %%
```

Multiple side notes on the same line are stacked vertically:

```
Some text. %%> First note. %% More text. %%> Second note. %%
```

Side notes also work on list items:

```
- List item %%> A note about this item. %%
```

## How It Works

- **Live Preview**: Uses a CodeMirror view plugin to replace `%%> ... %%` syntax with rendered `<aside>` widgets positioned to the left of the content column.
- **Reading View**: Uses a Markdown post-processor to inject side note elements into the DOM after rendering.

On mobile or narrow viewports, side notes collapse inline below their associated content.

## Building

```bash
pnpm install
pnpm run build
```

## Installation

Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/side-notes/` directory.

## Attribution

The `%%> ... %%` side note syntax and the concept of margin notes in Obsidian were inspired by [Cornell Marginalia](https://github.com/latazadehomero/cornell-marginalia) by latazadehomero. No code from that project was used — only the idea and syntax.

## License

MIT
