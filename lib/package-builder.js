"use strict";

const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
const lodash = require('lodash');
const { exec } = require("child_process");

const ComponentTemplateReader = require('./template-reader.js');
const ComponentPackageModelReader = require('./package-model-reader.js');

class ComponentPackageBuilder {
	constructor(baseTemplateSourcePath, baseDestinationPath, logger) {
		this._checkTemplateSourcePathValidOrThrow(baseTemplateSourcePath);
		this._checkDestinationPathValidOrThrow(baseDestinationPath);
		this._checkLoggerValidOrThrow(logger);

		this._template = null;
		this._baseTemplateSourcePath = baseTemplateSourcePath;
		this._baseDestinationPath = path.normalize(baseDestinationPath);

		this._templatePlacholders = this._createTemplatePlaceholders();
		this._packageModelData = ComponentPackageModelReader.getEmptyData();
		this._logger = logger;
	};

	_checkTemplateSourcePathValidOrThrow(templateSourcePath) {
		if (!templateSourcePath) {
			throw new Error('Template source path is required, but not provided');
		}
	}

	_checkDestinationPathValidOrThrow(destinationPath) {
		if (!destinationPath) {
			throw new Error('Destination path is required, but not provided.');
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	_createTemplatePlaceholders() {
		return {
			libraryName: '${LibraryName}',
			libraryNameDashed: '${LibraryNameDashed}',
			packageName: '${PackageName}',
			packageNameLower: '${PackageNameLower}',
			packageDescription: '${PackageDescription}',
			packageAuthor: '${PackageAuthor}',
			currentYear: '${CurrentYear}'
		};
	}

	create(onReady) {
		this._readTemplate();
		this._readPackageModel(() => {
			if (this._hasFilledInPackageModel()) {
				this._createPackage(onReady);
			} else {
				onReady(false);
			}
		});
	}

	_readTemplate() {
		const templateReader = this._createTemplateReader();
		this._template = templateReader.read();
		return this._template;
	}

	_createTemplateReader() {
		return new ComponentTemplateReader(this._baseTemplateSourcePath, 
			this._logger);
	}

	_readPackageModel(onReady) {
		const packageModelReader = this._creatPackageModelReader();
		packageModelReader.readFromUserInput((packageModelData) => {
			this._packageModelData = packageModelData;
			onReady();
		});
	}

	_creatPackageModelReader() {
		return new ComponentPackageModelReader(this._logger);
	}

	_hasFilledInPackageModel() {
		return !!this._packageModelData.packageName;
	}

	_createPackage(onReady) {
		const destinationPath = this._determineDestinationPath();
		this._ensureDestinationPathExists(destinationPath);

		const packageContents = this._createPackageContents();
		this._writePackageContents(packageContents, destinationPath);

		this._installPackageDependencies(destinationPath, (success) => {
			onReady(true);
		});
	}

	_createPackageContents() {
		this._logger.debug('Building package contents...');
		const packageContents = this._processTemplate(this._template);
		
		this._logger.debug('Done building package contents.');
		return packageContents;
	}

	_processTemplate(template) {
		const packageContents = [];
	
		template.forEach((templateItem) => {
			const packageItem = lodash.cloneDeep(templateItem);
			if (this._shouldIgnorePackageItem(packageItem)) {
				return;
			}
			
			packageItem.fileName = this._processFileName(packageItem.fileName);
			if (packageItem.isDirectory) {
				packageItem.items = this._processTemplate(packageItem.items);
			} else {
				packageItem.contents = this._replacePlaceholders(packageItem.contents);
			}
	
			packageContents.push(packageItem);
		});
	
		return packageContents;
	}

	_determineDestinationPath() {
		return path.join(this._baseDestinationPath, this._packageModelData.packageNameLower);
	}

	_shouldIgnorePackageItem(packageItem) {
		return utils.isDummyFile(packageItem.fileName);
	}

	_processFileName(fileName) {
		let finalFileName = fileName;
		if (utils.isGitIgnoreSurogateFile(finalFileName)) {
			finalFileName = utils.convertToRegularGitIgnoreFileName(finalFileName);
		} else if (utils.isTemplateFileName(finalFileName)) {
			finalFileName = this._replacePlaceholders(finalFileName);
		}
		return finalFileName;
	}

	_replacePlaceholders(source) {
		let result = source;
		const templatePlacholders = this._templatePlacholders;
		const packageModelData = this._packageModelData;
	
		for (const placeholderKey in templatePlacholders) {
			if (templatePlacholders.hasOwnProperty(placeholderKey)) {
				const placholder = templatePlacholders[placeholderKey];
				const bindValue = packageModelData[placeholderKey];

				result = result.replaceAll(placholder, 
					bindValue);
			}
		}
	
		return result;
	}

	_ensureDestinationPathExists(destinationPath) {
		this._logger.debug(`Ensuring destination path ${destinationPath} exists...`);
		utils.ensureDirectoryExists(destinationPath);
	}

	_writePackageContents(packageContents, destinationPath) {
		this._logger.debug('Writing package contents on disk...');

		packageContents.forEach((packageItem) => {
			const itemPath = path.join(destinationPath, 
				packageItem.fileName);
	
			this._preparePackageItem(packageItem, 
				itemPath);
	
			this._writePackageItemContents(packageItem, 
				itemPath);
		});

		this._logger.debug('Done writing package contents.');
	}
	
	_preparePackageItem(packageItem, itemPath) {
		if (!fs.existsSync(itemPath) && packageItem.isDirectory) {
			fs.mkdirSync(itemPath, {
				recursive: true
			});
		}
	}
	
	_writePackageItemContents(packageItem, itemPath) {
		if (packageItem.isDirectory) {
			this._writePackageContents(packageItem.items, 
				itemPath);
		} else {
			fs.writeFileSync(itemPath, packageItem.contents, {
				encoding: 'utf-8'
			});
		}
	}

	_installPackageDependencies(destinationPath, onReady) {
		const returnToDir = process.cwd();
	
		this._logger.debug('Attempting to install package dependencies...');
		process.chdir(destinationPath);

		exec('npm install', {
			encoding: 'utf8',
			windowsHide: true
		}, (error, stdout, stderr) => {
			let success = false;

			if (error) {
				this._logger.error(error.message);
			} else if (stderr) {
				this._logger.warning(stderr);
				success = true;
			} else {
				success = true;
			}

			if (!!stdout) {
				this._logger.debug(stdout);
			}

			if (!success) {
				this._logger.reportProgressWarning('There was an issue while installing dependencies. Please consult the logs for more details.');
			} else {
				this._logger.debug('Successfully installed package dependencies.');
			}

			process.chdir(returnToDir);
			onReady(success);
		});
	}
}

module.exports = ComponentPackageBuilder;