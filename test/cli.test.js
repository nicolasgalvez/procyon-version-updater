const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;

describe('CLI', function () {
	const basePath = path.join(__dirname, 'test-plugin');
	const pluginJsonPath = path.join(basePath, 'plugin.json');
	const pluginFilePath = path.join(basePath, 'test-plugin.php');
	const readmePath = path.join(basePath, 'readme.txt');
	const cliPath = path.join(__dirname, '../bin/cli.js');

	it('should display help if no arguments are passed', function (done) {
		exec(`node ${cliPath}`, (error, stdout, stderr) => {
			expect(stderr).to.include('Usage: plugin-updater <slug>');
			expect(stderr).to.include('--type=plugin|theme');
			done();
		});
	});

	it('should reject an invalid --type value', function (done) {
		exec(
			`node ${cliPath} some-slug --type=widget`,
			(error, stdout, stderr) => {
				expect(stderr).to.include('--type must be "plugin" or "theme"');
				done();
			}
		);
	});

	before(function () {
		if (!fs.existsSync(basePath)) {
			fs.mkdirSync(basePath);
		}
		fs.writeFileSync(pluginJsonPath, JSON.stringify({ version: '1.0.0' }));
		fs.writeFileSync(pluginFilePath, '<?php\n/*\nVersion: 1.0.0\n*/\n?>');
		fs.writeFileSync(
			readmePath,
			'== Changelog ==\n\n= 1.0.0 =\n* Initial release\n\n'
		);
	});

	after(function () {
		fs.unlinkSync(pluginJsonPath);
		fs.unlinkSync(pluginFilePath);
		fs.unlinkSync(readmePath);
		fs.rmdirSync(basePath);
	});

	it('should update the plugin version via CLI', function (done) {
		const newVersion = '1.1.0';
		const command = `node ${cliPath} test-plugin --version=${newVersion} --message="Test release"`;

		exec(command, { cwd: basePath }, (error) => {
			if (error) {
				return done(error);
			}

			const updatedPluginJson = JSON.parse(
				fs.readFileSync(pluginJsonPath, 'utf-8')
			);
			const updatedPluginFile = fs.readFileSync(pluginFilePath, 'utf-8');
			const updatedReadme = fs.readFileSync(readmePath, 'utf-8');

			expect(updatedPluginJson.version).to.equal(newVersion);
			expect(updatedPluginFile).to.include(`Version: ${newVersion}`);
			expect(updatedReadme).to.include(
				`== Changelog ==\n\n= ${newVersion} =\n* Test release\n\n`
			);
			done();
		});
	});
});

describe('CLI (theme)', function () {
	const basePath = path.join(__dirname, 'test-theme');
	const stylePath = path.join(basePath, 'style.css');
	const changelogPath = path.join(basePath, 'CHANGELOG.md');
	const cliPath = path.join(__dirname, '../bin/cli.js');

	before(function () {
		if (!fs.existsSync(basePath)) {
			fs.mkdirSync(basePath);
		}
		fs.writeFileSync(
			stylePath,
			'/*\nTheme Name: Test Theme\nVersion: 1.0.0\n*/\n'
		);
		fs.writeFileSync(
			changelogPath,
			'# Changelog\n\n## 1.0.0 - 2025-01-01\n\n- Initial release\n'
		);
	});

	after(function () {
		fs.unlinkSync(stylePath);
		fs.unlinkSync(changelogPath);
		fs.rmdirSync(basePath);
	});

	it('should update style.css and CHANGELOG.md via CLI auto-detection', function (done) {
		const newVersion = '1.1.0';
		const command = `node ${cliPath} test-theme --version=${newVersion} --message="Theme release"`;

		exec(command, { cwd: basePath }, (error) => {
			if (error) {
				return done(error);
			}

			const updatedStyle = fs.readFileSync(stylePath, 'utf-8');
			const updatedChangelog = fs.readFileSync(changelogPath, 'utf-8');

			expect(updatedStyle).to.include(`Version: ${newVersion}`);
			expect(updatedChangelog).to.include(`## ${newVersion}`);
			expect(updatedChangelog).to.include('Theme release');
			done();
		});
	});
});
