/**
 * Update the version of a WordPress plugin.
 *
 * Built for use with yahnis-elsts/plugin-update-checker.
 *
 * @see https://github.com/YahnisElsts/plugin-update-checker
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const semver = require('semver');

function getCurrentVersion(pluginJsonPath) {
	if (!fs.existsSync(pluginJsonPath)) {
		throw new Error(`Error: ${pluginJsonPath} not found.`);
	}
	const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
	return pluginJson.version || '0.0.0';
}

function updatePluginJson(pluginJsonPath, newVersion) {
	const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
	pluginJson.version = newVersion;
	fs.writeFileSync(pluginJsonPath, JSON.stringify(pluginJson, null, 2));
	console.log(`Updated version in ${pluginJsonPath}`);
}

function updatePluginHeader(pluginFilePath, newVersion) {
	if (!fs.existsSync(pluginFilePath)) {
		throw new Error(`Error: ${pluginFilePath} not found.`);
	}
	const content = fs.readFileSync(pluginFilePath, 'utf-8');
	const updatedContent = content.replace(
		/Version:\s*[0-9.]+/,
		`Version: ${newVersion}`
	);
	fs.writeFileSync(pluginFilePath, updatedContent);
	console.log(`Updated version in ${pluginFilePath}`);
}

function updateReadme(readmePath, newVersion, releaseMessage) {
	if (!fs.existsSync(readmePath)) {
		throw new Error(`Error: ${readmePath} not found.`);
	}
	const content = fs.readFileSync(readmePath, 'utf-8');
	const changelogEntry = `= ${newVersion} =\n* ${releaseMessage}\n\n`;
	const updatedContent = content.replace(
		/== Changelog ==\n/,
		`== Changelog ==\n\n${changelogEntry}`
	);
	fs.writeFileSync(readmePath, updatedContent);
	console.log(`Updated changelog in ${readmePath}`);
}

function updateVersion(slug, version = null, message = 'Release') {
	if (!fs.existsSync('plugin.json')) {
		throw new Error('Error: plugin.json not found in current directory');
	}
	const basePath = path.join(process.cwd());
	const pluginJsonPath = path.join(basePath, 'plugin.json');
	const pluginFilePath = path.join(basePath, `${slug}.php`);
	const readmePath = path.join(basePath, 'readme.txt');

	// Determine version
	const currentVersion = getCurrentVersion(pluginJsonPath);
	const newVersion = version || semver.inc(currentVersion, 'patch');

	console.log(`Updating version to: ${newVersion}`);

	// Update files
	updatePluginJson(pluginJsonPath, newVersion);
	updatePluginHeader(pluginFilePath, newVersion);
	updateReadme(readmePath, newVersion, message);
}

module.exports = { updateVersion };
