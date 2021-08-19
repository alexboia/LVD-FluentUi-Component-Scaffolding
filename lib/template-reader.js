"use strict";

const fs = require('fs');
const path = require('path');

class ComponentTemplateReader {
	constructor(baseSourcePath, logger) {
		this._checkSourceDirectoryValidOrThrow(baseSourcePath);
		this._checkLoggerValidOrThrow(logger);
		
		this._sourcePath = path.normalize(baseSourcePath);
		this._logger = logger;
	}

	_checkSourceDirectoryValidOrThrow(baseSourcePath) {
		if (!baseSourcePath) {
			throw new Error('Source directory is required, but not provided.');
		}

		if (!fs.existsSync(baseSourcePath)) {
			throw new Error(`Source directory ${baseSourcePath} does not exist.`);
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	read() {
		const templateLocation = this._determineTemplateLocation();
		this._checkTemplateLocationExistsOrThrow(templateLocation);

		this._logger.debug(`Reading template from ${templateLocation}...`);
		const template = this._getTemplateContentsRecursively(templateLocation);

		this._logger.debug(`Done reading template. Found ${template.length} top level entries.`);
		return template;
	}

	_checkTemplateLocationExistsOrThrow(templateLocation) {
		if (!fs.existsSync(templateLocation)) {
			throw new Error(`No template directory found in source directory ${this._sourcePath}.`);
		}
	}

	_determineTemplateLocation() {
		return path.normalize(path.join(this._sourcePath, 'template'));
	}

	_getTemplateContentsRecursively(directoryPath) {
		const result = [];
		const files = fs.readdirSync(directoryPath);
		
		files.forEach((fileName) => {
			const filePath = path.join(directoryPath, fileName);
			const isDirectory = this._isDirectory(filePath);
	
			const resultItem = {
				fileName: fileName,
				isDirectory: isDirectory,
				contents: !isDirectory 
					? this._readFileContents(filePath)
					: null,
				items: isDirectory 
					? this._getTemplateContentsRecursively(filePath) 
					: null
			};
	
			result.push(resultItem);
		});
	
		return result;
	}

	_readFileContents(filePath) {
		return fs.readFileSync(filePath, {
			encoding: 'utf8'
		});
	}

	_isDirectory(filePath) {
		return fs.statSync(filePath)
			.isDirectory();
	}
}

module.exports = ComponentTemplateReader;