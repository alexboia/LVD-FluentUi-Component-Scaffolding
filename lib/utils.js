const fs = require('fs');

function isTemplateFileName(fileName) {
	return fileName.indexOf('${') >= 0;
}

function isDummyFile(fileName) {
	return fileName.indexOf('.dummy') >= 0;
}

function isGitIgnoreSurogateFile(fileName) {
	return fileName.indexOf('.ignore') >= 0;
}

function convertToRegularGitIgnoreFileName(fileName) {
	return fileName.replaceAll('.ignore', '.gitignore');
}

function extractDefaultLibraryName(packageName) {
	const readFromIndex = packageName.lastIndexOf('-');
	if (readFromIndex >= 0) {
		return packageName.substring(readFromIndex + 1);
	} else {
		return null;
	}
}

function extractDefaultDashedLibraryName(libraryName) {
	return libraryName.replace(/[A-Z]/g, function(char, index) {
		return (index !== 0 ? '-' : '') + char.toLowerCase();
	});
}

function ensureDirectoryExists(destinationPath) {
	if (!fs.existsSync(destinationPath)) {
		fs.mkdirSync(destinationPath, {
			recursive: true
		});
	}
}

module.exports = {
	isDummyFile: isDummyFile,
	isTemplateFileName: isTemplateFileName,
	isGitIgnoreSurogateFile: isGitIgnoreSurogateFile,
	convertToRegularGitIgnoreFileName: convertToRegularGitIgnoreFileName,
	extractDefaultLibraryName: extractDefaultLibraryName,
	extractDefaultDashedLibraryName: extractDefaultDashedLibraryName,
	ensureDirectoryExists: ensureDirectoryExists
};