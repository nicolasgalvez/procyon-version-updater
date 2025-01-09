const fs = require('fs');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const updater = require('../lib/updater');

describe('Updater', function () {
	it('should have a function to update plugin versions', function () {
		expect(updater.updateVersion).to.be.a('function');
	});

	it('should throw an error if plugin.json not found', function () {
		const pluginData = 'plugin-slug';
		const newVersion = '1.1.0';
		expect(() => updater.updateVersion(pluginData, newVersion)).to.throw();
	});

	describe('updateVersion', function () {
		const basePath = path.join(__dirname, 'test-plugin');
		const pluginJsonPath = path.join(basePath, 'plugin.json');
		const pluginFilePath = path.join(basePath, 'test-plugin.php');
		const readmePath = path.join(basePath, 'readme.txt');

		before(function () {
			if (!fs.existsSync(basePath)) {
				fs.mkdirSync(basePath);
			}
			fs.writeFileSync(
				pluginJsonPath,
				JSON.stringify({ version: '1.0.0' })
			);
			fs.writeFileSync(
				pluginFilePath,
				'<?php\n/*\nVersion: 1.0.0\n*/\n?>'
			);
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

		it('should correctly update the plugin version in all files', function () {
			const newVersion = '1.1.0';
			process.chdir(basePath);
			updater.updateVersion('test-plugin', newVersion, 'Test release');

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
			process.chdir(__dirname);
		});

		it('should correctly update the plugin version if no version is passed', function () {
			const newVersion = '1.1.1';
			process.chdir(basePath);
			updater.updateVersion('test-plugin', null, 'Test release');

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
			process.chdir(__dirname);
		});
	});
});
