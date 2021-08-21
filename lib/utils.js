const fs = require('fs');
const path = require('path');

const DummyFileName = '.dummy';
const GitIgnoreSurogateFileName = '.ignore';
const GitIgnorFileName = '.gitignore';
const VsCodeWorkspaceFileMarker = '.code-workspace';
const TemplateFileNameMarker = '${';

function isTemplateFileName(fileName) {
	return fileName.indexOf(TemplateFileNameMarker) >= 0;
}

function isVsCodeWorkspaceFile(fileName) {
	return fileName.indexOf(VsCodeWorkspaceFileMarker) >= 0;
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

	//courtesy of https://coderwall.com/p/hpq7sq/undescorize-dasherize-capitalize-string-prototype
	let dashedLibraryName = libraryName.replace(/[A-Z_]/g, 
		(char, index) => {
			return (index !== 0 ? '-' : '') + char.toLowerCase();
		});

	//also replace underscores with dashes
	dashedLibraryName = dashedLibraryName
		.replace(/[_]/g, '-');

	return normalizeDashedLibraryName(dashedLibraryName);
}

function normalizeDashedLibraryName(dashedLibraryName) {
	let normalizedValue = dashedLibraryName
		.replace(/[\-]+/g, '-');

	//no dash at beginning
	normalizedValue = normalizedValue
		.replace(/^[\-]*/g, '');

	//no dash at the end
	normalizedValue = normalizedValue
		.replace(/[\-]*$/g, '');

	return normalizedValue;
}

function ensureDirectoryExists(destinationPath) {
	if (!fs.existsSync(destinationPath)) {
		fs.mkdirSync(destinationPath, {
			recursive: true
		});
	}
}

function normalizeAndEnsureDirectoryExists(destinationPath) {
	const finalPath = path.resolve(destinationPath);
	ensureDirectoryExists(finalPath);
	return finalPath;
}

module.exports = {
	isDummyFile: isDummyFile,
	isTemplateFileName: isTemplateFileName,
	isVsCodeWorkspaceFile: isVsCodeWorkspaceFile,
	isGitIgnoreSurogateFile: isGitIgnoreSurogateFile,
	convertToRegularGitIgnoreFileName: convertToRegularGitIgnoreFileName,
	extractDefaultLibraryName: extractDefaultLibraryName,
	extractDefaultDashedLibraryName: extractDefaultDashedLibraryName,
	normalizeDashedLibraryName: normalizeDashedLibraryName,
	ensureDirectoryExists: ensureDirectoryExists,
	normalizeAndEnsureDirectoryExists: normalizeAndEnsureDirectoryExists
};