const path = require('path');
const utils = require('./utils.js');
const { printTable, Table } = require('console-table-printer');
const { DEFAULT_TABLE_STYLE } = require('console-table-printer/')

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

		printToConsole: function(title = null, indentationAmount = 0) {
			const indent = indentationAmount > 0 
				? '\t'.repeat(indentationAmount)
				: '';

			const table = new Table({
				title: title
			});

			const tableData = [
				{ Property: 'Package name', Value: this.packageName || EmptyValueDescriptor },
				{ Property: 'Package author', Value: this.packageAuthor || EmptyValueDescriptor },
				{ Property: 'Package description', Value: this.packageDescription || EmptyValueDescriptor },
				{ Property: 'Library name', Value: this.libraryName || EmptyValueDescriptor },
				{ Property: 'Library name dashed', Value: this.libraryNameDashed || EmptyValueDescriptor }
			];

			table.addRows(tableData);
			
			const renderedTable = table.render();
			const renderedTableParts = renderedTable.split('\n');
			
			renderedTableParts.forEach((line) => {
				console.log(indent + line);
			});
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