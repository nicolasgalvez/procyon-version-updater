/**
 * Update the version of a WordPress plugin or theme.
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

function updateVersionHeader(filePath, newVersion) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`Error: ${filePath} not found.`);
	}
	const content = fs.readFileSync(filePath, 'utf-8');
	const updatedContent = content.replace(
		/Version:\s*[0-9.]+/,
		`Version: ${newVersion}`
	);
	fs.writeFileSync(filePath, updatedContent);
	console.log(`Updated version in ${filePath}`);
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

function updateChangelogMd(changelogPath, newVersion, releaseMessage) {
	const content = fs.readFileSync(changelogPath, 'utf-8');
	const date = new Date().toISOString().slice(0, 10);
	const entry = `## ${newVersion} - ${date}\n\n- ${releaseMessage}\n\n`;

	let updatedContent;
	if (/^##\s+\[?Unreleased\]?/m.test(content)) {
		// Replace an existing "## Unreleased" section header with the new version.
		updatedContent = content.replace(
			/^##\s+\[?Unreleased\]?.*$/m,
			`## ${newVersion} - ${date}`
		);
	} else if (/^## /m.test(content)) {
		// Insert above the first H2 entry (most recent existing release).
		updatedContent = content.replace(/^(## )/m, `${entry}$1`);
	} else if (/^# /m.test(content)) {
		// Insert just below the first H1.
		updatedContent = content.replace(/^(# .*\n)/m, `$1\n${entry}`);
	} else {
		updatedContent = entry + content;
	}

	fs.writeFileSync(changelogPath, updatedContent);
	console.log(`Updated changelog in ${changelogPath}`);
}

function detectProjectType(basePath, slug) {
	const stylePath = path.join(basePath, 'style.css');
	if (fs.existsSync(stylePath)) {
		const content = fs.readFileSync(stylePath, 'utf-8');
		if (/Theme Name:/i.test(content)) {
			return 'theme';
		}
	}

	if (slug && fs.existsSync(path.join(basePath, `${slug}.php`))) {
		return 'plugin';
	}

	if (fs.existsSync(path.join(basePath, 'plugin.json'))) {
		return 'plugin';
	}

	throw new Error(
		'Could not detect project type. Expected style.css (theme), <slug>.php, or plugin.json in the current directory. Pass --type=plugin|theme to override.'
	);
}

function getCurrentVersionFromHeader(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`Error: ${filePath} not found.`);
	}
	const content = fs.readFileSync(filePath, 'utf-8');
	const match = content.match(/Version:\s*([0-9.]+)/);
	if (!match) {
		throw new Error(`Error: Version header not found in ${filePath}`);
	}
	return match[1];
}

function updateThemeVersion(newVersion, message) {
	const basePath = process.cwd();
	const stylePath = path.join(basePath, 'style.css');
	const readmePath = path.join(basePath, 'readme.txt');
	const changelogMdPath = path.join(basePath, 'CHANGELOG.md');

	updateVersionHeader(stylePath, newVersion);

	if (fs.existsSync(readmePath)) {
		updateReadme(readmePath, newVersion, message);
	} else if (fs.existsSync(changelogMdPath)) {
		updateChangelogMd(changelogMdPath, newVersion, message);
	} else {
		console.log(
			'Note: no readme.txt or CHANGELOG.md found — skipping changelog update.'
		);
	}
}

function updatePluginVersion(slug, newVersion, message) {
	const basePath = process.cwd();
	const pluginJsonPath = path.join(basePath, 'plugin.json');
	const pluginFilePath = path.join(basePath, `${slug}.php`);
	const readmePath = path.join(basePath, 'readme.txt');

	updatePluginJson(pluginJsonPath, newVersion);
	updateVersionHeader(pluginFilePath, newVersion);
	updateReadme(readmePath, newVersion, message);
}

function updateVersion(
	slug,
	version = null,
	message = 'Release',
	options = {}
) {
	const basePath = process.cwd();
	const type = options.type || detectProjectType(basePath, slug);

	let currentVersion;
	if (type === 'theme') {
		const stylePath = path.join(basePath, 'style.css');
		if (!fs.existsSync(stylePath)) {
			throw new Error('Error: style.css not found in current directory');
		}
		currentVersion = getCurrentVersionFromHeader(stylePath);
	} else {
		const pluginJsonPath = path.join(basePath, 'plugin.json');
		if (!fs.existsSync(pluginJsonPath)) {
			throw new Error(
				'Error: plugin.json not found in current directory'
			);
		}
		currentVersion = getCurrentVersion(pluginJsonPath);
	}

	const newVersion = version || semver.inc(currentVersion, 'patch');

	console.log(`Updating ${type} version to: ${newVersion}`);

	if (type === 'theme') {
		updateThemeVersion(newVersion, message);
	} else {
		updatePluginVersion(slug, newVersion, message);
	}
}

module.exports = { updateVersion, detectProjectType };
