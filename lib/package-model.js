const path = require('path');
const utils = require('./utils.js');
const { printTable } = require('console-table-printer');

const EmptyValueDescriptor = '[empty]';
const PackageNameRegex = /^[a-zA-Z0-9\-]+$/g;
const LibraryNameRegex = /^[a-zA-Z0-9_]+$/g;
const DashedLibraryNameRegex = /^[a-zA-Z0-9\-]+$/g;

function createEmptyPackageModelData() {
	return {
		libraryName: null,
		libraryNameDashed: null,
		packageName: null,
		packageNameLower: null,
		packageDescription: null,
		packageAuthor: null,
		currentYear: new Date().getFullYear(),
		logDirectoryName: null,

		printToConsole: function(title = null) {
			const tableData = [
				{ property: 'Package name', value: this.packageName || EmptyValueDescriptor },
				{ property: 'Package author', value: this.packageAuthor || EmptyValueDescriptor },
				{ property: 'Package description', value: this.packageDescription || EmptyValueDescriptor },
				{ property: 'Library name', value: this.libraryName || EmptyValueDescriptor },
				{ property: 'Library name dashed', value: this.libraryNameDashed || EmptyValueDescriptor }
			];

			if (!!title) {
				console.log(title);
			}

			printTable(tableData);
		},

		setLogDirectoryName: function(logDirectoryName) {
			this.logDirectoryName = logDirectoryName;
		},

		setPackageName: function(packageName) {
			if (!!packageName) {
				this.packageName = packageName;
				this.packageNameLower = packageName.toLowerCase();
				this.setLibraryName(utils.extractDefaultLibraryName(packageName));
			}
		},

		setPackageDescription: function(packageDescription) {
			if (!!packageDescription) {
				this.packageDescription = packageDescription;
			}
		},

		setPackageAuthor: function(packageAuthor) {
			if (!!packageAuthor) {
				this.packageAuthor = packageAuthor;
			}
		},

		setLibraryName: function(libraryName) {
			if (!!libraryName) {
				this.libraryName = libraryName;
				this.setDashedLibraryName(utils.extractDefaultDashedLibraryName(libraryName));
			}
		},

		setDashedLibraryName: function(dashedLibraryName) {
			if (!!dashedLibraryName) {
				this.libraryNameDashed = utils.normalizeDashedLibraryName(dashedLibraryName);
			}
		}
	};
}

function createPackageModelDataFromContext(context) {
	let defaultPackageName = null;
	const baseDestinationPath = context.getBaseDestinationPath();
	const logDirectoryName = path.basename(context.getLogDirectory());

	if (!context.shouldCreateRoot()) {
		defaultPackageName = tryGuessDefaultPackageName(baseDestinationPath);
	}

	const packageModelData = createEmptyPackageModelData();

	packageModelData.setLogDirectoryName(logDirectoryName);
	packageModelData.setPackageName(defaultPackageName);

	return packageModelData;
}

function tryGuessDefaultPackageName(fromPath) {
	if (!fromPath) {
		return null;
	}

	let defaultPackageName = path.basename(fromPath);
	if (!isPackageNameValid(defaultPackageName)) {
		defaultPackageName = null;
	}

	return defaultPackageName;
}

function isPackageNameValid(packageName) {
	return !!packageName.match(PackageNameRegex);
}

function isLibraryNameValid(libraryName) {
	return !!libraryName.match(LibraryNameRegex);
}

function isDashedLibraryNameValid(dashedLibraryName) {
	return !!dashedLibraryName.match(DashedLibraryNameRegex);
}

module.exports = {
	createEmptyPackageModelData: createEmptyPackageModelData,
	createPackageModelDataFromContext: createPackageModelDataFromContext,
	tryGuessDefaultPackageName: tryGuessDefaultPackageName,
	isPackageNameValid: isPackageNameValid,
	isLibraryNameValid: isLibraryNameValid,
	isDashedLibraryNameValid: isDashedLibraryNameValid
};