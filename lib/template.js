const fs = require('fs');
const path = require('path');

class ComponentTemplate {
	constructor(source) {
		if (!source) {
			throw new Error('Source is required, but not provided.');
		}

		this.source = source;
	}

	read() {
		const templateLocation = this._determineTemplateLocation();
		return this._getTemplateDirectoryContentsRecursively(templateLocation);
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