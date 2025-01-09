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
			expect(stderr).to.include(
				'Usage: plugin-updater <slug> [--version=<number>] [--message=<string>]'
			);
			done();
		});
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
