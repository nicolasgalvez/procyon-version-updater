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

	describe('updateVersion (theme)', function () {
		const basePath = path.join(__dirname, 'test-theme');
		const stylePath = path.join(basePath, 'style.css');
		const changelogPath = path.join(basePath, 'CHANGELOG.md');

		beforeEach(function () {
			if (!fs.existsSync(basePath)) {
				fs.mkdirSync(basePath);
			}
			fs.writeFileSync(
				stylePath,
				'/*\nTheme Name: Test Theme\nTemplate: kadence\nVersion: 1.0.0\n*/\n'
			);
			fs.writeFileSync(
				changelogPath,
				'# Changelog\n\n## 1.0.0 - 2025-01-01\n\n- Initial release\n'
			);
		});

		afterEach(function () {
			if (fs.existsSync(stylePath)) fs.unlinkSync(stylePath);
			if (fs.existsSync(changelogPath)) fs.unlinkSync(changelogPath);
			if (fs.existsSync(basePath)) fs.rmdirSync(basePath);
		});

		it('should detect a theme by style.css and update the Version header', function () {
			const newVersion = '1.1.0';
			process.chdir(basePath);
			updater.updateVersion('test-theme', newVersion, 'Theme release');

			const updatedStyle = fs.readFileSync(stylePath, 'utf-8');
			const updatedChangelog = fs.readFileSync(changelogPath, 'utf-8');

			expect(updatedStyle).to.include(`Version: ${newVersion}`);
			expect(updatedStyle).to.include('Theme Name: Test Theme');
			expect(updatedChangelog).to.include(`## ${newVersion}`);
			expect(updatedChangelog).to.include('- Theme release');
			expect(updatedChangelog).to.include('## 1.0.0 - 2025-01-01');
			process.chdir(__dirname);
		});

		it('should bump patch version from style.css when none is passed', function () {
			process.chdir(basePath);
			updater.updateVersion('test-theme', null, 'Patch release');

			const updatedStyle = fs.readFileSync(stylePath, 'utf-8');
			expect(updatedStyle).to.include('Version: 1.0.1');
			process.chdir(__dirname);
		});

		it('should not require a changelog file', function () {
			fs.unlinkSync(changelogPath);
			process.chdir(basePath);
			expect(() =>
				updater.updateVersion('test-theme', '1.2.0', 'No changelog')
			).to.not.throw();
			const updatedStyle = fs.readFileSync(stylePath, 'utf-8');
			expect(updatedStyle).to.include('Version: 1.2.0');
			process.chdir(__dirname);
		});

		it('should respect explicit --type=theme', function () {
			const newVersion = '1.3.0';
			process.chdir(basePath);
			updater.updateVersion('whatever-slug', newVersion, 'msg', {
				type: 'theme',
			});
			const updatedStyle = fs.readFileSync(stylePath, 'utf-8');
			expect(updatedStyle).to.include(`Version: ${newVersion}`);
			process.chdir(__dirname);
		});
	});

	describe('detectProjectType', function () {
		const basePath = path.join(__dirname, 'detect-fixture');

		beforeEach(function () {
			if (!fs.existsSync(basePath)) {
				fs.mkdirSync(basePath);
			}
		});

		afterEach(function () {
			if (fs.existsSync(basePath)) {
				fs.readdirSync(basePath).forEach((f) =>
					fs.unlinkSync(path.join(basePath, f))
				);
				fs.rmdirSync(basePath);
			}
		});

		it('detects a theme when style.css has Theme Name', function () {
			fs.writeFileSync(
				path.join(basePath, 'style.css'),
				'/*\nTheme Name: Foo\nVersion: 1.0.0\n*/'
			);
			expect(updater.detectProjectType(basePath, 'foo')).to.equal(
				'theme'
			);
		});

		it('detects a plugin when slug.php exists', function () {
			fs.writeFileSync(
				path.join(basePath, 'foo.php'),
				'<?php\n/*\nVersion: 1.0.0\n*/'
			);
			expect(updater.detectProjectType(basePath, 'foo')).to.equal(
				'plugin'
			);
		});

		it('detects a plugin when only plugin.json exists', function () {
			fs.writeFileSync(
				path.join(basePath, 'plugin.json'),
				JSON.stringify({ version: '1.0.0' })
			);
			expect(updater.detectProjectType(basePath, 'foo')).to.equal(
				'plugin'
			);
		});

		it('throws when nothing matches', function () {
			expect(() => updater.detectProjectType(basePath, 'foo')).to.throw(
				/Could not detect project type/
			);
		});

		it('treats style.css without Theme Name as plugin context', function () {
			fs.writeFileSync(
				path.join(basePath, 'style.css'),
				'body { color: red; }'
			);
			fs.writeFileSync(
				path.join(basePath, 'plugin.json'),
				JSON.stringify({ version: '1.0.0' })
			);
			expect(updater.detectProjectType(basePath, 'foo')).to.equal(
				'plugin'
			);
		});
	});
});
