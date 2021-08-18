const fs = require('fs');
const path = require('path');

const DummyFileName = '.dummy';
const GitIgnoreSurogateFileName = '.ignore';
const GitIgnorFileName = '.gitignore';
const TemplateFileNameMarker = '${';

function isTemplateFileName(fileName) {
	return fileName.indexOf(TemplateFileNameMarker) >= 0;
}

function isDummyFile(fileName) {
	return fileName.indexOf(DummyFileName) >= 0;
}

function isGitIgnoreSurogateFile(fileName) {
	return fileName.indexOf(GitIgnoreSurogateFileName) >= 0;
}

function convertToRegularGitIgnoreFileName(fileName) {
	return fileName.replaceAll(GitIgnoreSurogateFileName, GitIgnorFileName);
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
	if (!libraryName) {
		return libraryName;
	}

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

function normalizeAndEnsureDirectoryExists(destinationPath) {
	const finalPath = path.normalize(destinationPath);
	ensureDirectoryExists(finalPath);
	return finalPath;
}

function emptyDirectory(destinationPath) {

}

module.exports = {
	isDummyFile: isDummyFile,
	isTemplateFileName: isTemplateFileName,
	isGitIgnoreSurogateFile: isGitIgnoreSurogateFile,
	convertToRegularGitIgnoreFileName: convertToRegularGitIgnoreFileName,
	extractDefaultLibraryName: extractDefaultLibraryName,
	extractDefaultDashedLibraryName: extractDefaultDashedLibraryName,
	ensureDirectoryExists: ensureDirectoryExists,
	normalizeAndEnsureDirectoryExists: normalizeAndEnsureDirectoryExists
};