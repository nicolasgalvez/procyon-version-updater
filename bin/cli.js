#!/usr/bin/env node

/* eslint-disable no-console */
const minimist = require('minimist');
const { updateVersion } = require('../lib/updater');

// Parse arguments
const args = minimist(process.argv.slice(2), {
	alias: { version: 'v', message: 'm' },
	default: { version: null, message: 'Release' },
});

const slug = args._[0];
const newVersion = args.version;
const releaseMessage = args.message;

if (!slug) {
	console.error(
		'Usage: plugin-updater <slug> [--version=<number>] [--message=<string>]'
	);
	process.exit(1);
}

try {
	updateVersion(slug, newVersion, releaseMessage);
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
