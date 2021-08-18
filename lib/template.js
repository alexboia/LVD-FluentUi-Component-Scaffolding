const fs = require('fs');
const path = require('path');

class ComponentTemplate {
	constructor(source) {
		this._checkSourceDirectoryValidOrThrow(source);
		this.source = path.normalize(source);
	}

	_checkSourceDirectoryValidOrThrow(source) {
		if (!source) {
			throw new Error('Source directory is required, but not provided.');
		}

		if (!fs.existsSync(source)) {
			throw new Error(`Source ${source} directory does not exist.`);
		}
	}

	read() {
		const templateLocation = this._determineTemplateLocation();
		this._checkTemplateLocationExistsOrThrow(templateLocation);
		return this._getTemplateDirectoryContentsRecursively(templateLocation);
	}

	_checkTemplateLocationExistsOrThrow(templateLocation) {
		if (!fs.existsSync(templateLocation)) {
			throw new Error(`No template directory found in source directory ${this.source}.`);
		}
	}

	_determineTemplateLocation() {
		return path.normalize(path.join(this.source, 'template'));
	}

	_getTemplateDirectoryContentsRecursively(directoryPath) {
		const result = [];
		const files = fs.readdirSync(directoryPath);
		const me = this;
		
		files.forEach(function(fileName) {
			const filePath = path.join(directoryPath, fileName);
			const isDirectory = me._isDirectory(filePath);
	
			const resultItem = {
				fileName: fileName,
				isDirectory: isDirectory,
				contents: !isDirectory 
					? me._readFileContents(filePath)
					: null,
				items: isDirectory 
					? me._getTemplateDirectoryContentsRecursively(filePath) 
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

module.exports = ComponentTemplate;