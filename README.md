# @procyon-creative/plugin-updater

A CLI tool and library to update WordPress plugin and theme versions for YahnisElsts/plugin-update-checker.

I created it to be used with my [plugin-boilerplate](https://github.com/nicolasgalvez/procyon-plugin-boilerplate), but it can be used as a standalone tool if you are also tired of updating multiple files every time you release an update.

## Installation

Install the package using npm:

```sh
npm install @procyoncreative/plugin-updater
```

## Usage

### CLI

From inside your plugin or theme directory:

```sh
plugin-updater <slug> [--version=<number>] [--message=<string>] [--type=plugin|theme]
```

- `<slug>`: The slug of your plugin or theme (required).
- `--version, -v`: The new version number (optional, defaults to the next patch version).
- `--message, -m`: The release message for the changelog (optional, defaults to "Release").
- `--type, -t`: `plugin` or `theme`. Optional — auto-detected from the directory contents.

### Auto-detection

The tool decides what kind of project it's in based on which files it finds:

- **Theme** — there is a `style.css` containing a `Theme Name:` header.
- **Plugin** — there is a `<slug>.php` with a `Version:` header, or a `plugin.json`.

Pass `--type` if you need to force one over the other.

### What gets updated

**Plugin**:

- `plugin.json` — the version field
- `<slug>.php` — the `Version:` header
- `readme.txt` — a new entry under `== Changelog ==`

**Theme**:

- `style.css` — the `Version:` header
- `readme.txt` — a new entry under `== Changelog ==` (if the file exists)
- `CHANGELOG.md` — a new `## <version> - <date>` entry, replacing `## Unreleased` if found, otherwise inserted above the most recent existing entry

### Examples

```sh
plugin-updater my-plugin --version=1.1.0 --message="Bug fixes"
plugin-updater my-theme --version=2.0.0 --message="Redesign" --type=theme
plugin-updater my-plugin --message="Patch release"   # auto-bumps patch
```

### Library

You can also use the library programmatically.

```javascript
const { updateVersion } = require('@procyoncreative/plugin-updater');

// Auto-detected type
updateVersion('my-plugin', '1.1.0', 'Bug fixes and improvements');

// Forced type
updateVersion('my-theme', '2.0.0', 'Redesign', { type: 'theme' });
```

## Testing

Run the tests using Mocha:

```sh
npm test
```

## Linting

Lint the code using ESLint:

```sh
npm run lint
```

## License

MIT © Nick Galvez
