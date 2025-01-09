# @procyoncreative/plugin-updater

A CLI tool and library to update WordPress plugin versions for YahnisElsts/plugin-update-checker.

I created it to be used with my [plugin-boilerplate](https://github.com/nicolasgalvez/procyon-plugin-boilerplate), but it can be used as a standalone tool if you are also tired of updating 3 different files every time you release an update. I might also add an option to tag a release as well.

## Installation

Install the package using npm:

```sh
npm install @procyoncreative/plugin-updater
```

## Usage

### CLI

You can use the CLI to update the version of your WordPress plugin.

From inside your plugin's directory:
```sh
plugin-updater <slug> [--version=<number>] [--message=<string>]
```

- `<slug>`: The slug of your plugin (required). Used to find the proper php file in the plugin directory.
- `--version, -v`: The new version number (optional, defaults to the next patch version).
- `--message, -m`: The release message for the changelog (optional, defaults to "Release").

### Example

```sh
plugin-updater my-plugin --version=1.1.0 --message="Bug fixes and improvements"
```

### Library

You can also use the library programmatically.

```javascript
const { updateVersion } = require('@procyoncreative/plugin-updater');

updateVersion('my-plugin', '1.1.0', 'Bug fixes and improvements');
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
