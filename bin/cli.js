#!/usr/bin/env node

/* eslint-disable no-console */
const minimist = require('minimist');
const { updateVersion } = require('../lib/updater');

// Parse arguments
const args = minimist(process.argv.slice(2), {
	alias: { version: 'v', message: 'm', type: 't' },
	default: { version: null, message: 'Release', type: null },
});

const slug = args._[0];
const newVersion = args.version;
const releaseMessage = args.message;
const type = args.type;

if (!slug) {
	console.error(
		'Usage: plugin-updater <slug> [--version=<number>] [--message=<string>] [--type=plugin|theme]'
	);
	process.exit(1);
}

if (type && type !== 'plugin' && type !== 'theme') {
	console.error(`Error: --type must be "plugin" or "theme" (got "${type}")`);
	process.exit(1);
}

try {
	updateVersion(slug, newVersion, releaseMessage, { type });
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
