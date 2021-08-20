const path = require('path');
const utils = require('./utils.js');
const { printTable } = require('console-table-printer');

const EmptyValueDescriptor = '[empty]';

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
	return !!packageName.match(/^[a-zA-Z0-9\-]+$/g);
}

function isLibraryNameValid(packageName) {
	return !!packageName.match(/^[a-zA-Z0-9_]+$/g);
}

function isDashedLibraryNameValid(packageName) {
	return !!packageName.match(/^[a-zA-Z0-9\-]+$/g);
}

module.exports = {
	createEmptyPackageModelData: createEmptyPackageModelData,
	tryGuessDefaultPackageName: tryGuessDefaultPackageName,
	isPackageNameValid: isPackageNameValid,
	isLibraryNameValid: isLibraryNameValid,
	isDashedLibraryNameValid: isDashedLibraryNameValid
};