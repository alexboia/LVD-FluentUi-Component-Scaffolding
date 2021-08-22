// BSD 3-Clause License
// 
// LVD-FluentUi-Component-Scaffolding
// Copyright (c) 2021-2021, Alexandru Boia <alexandru.boia@gmail.com>
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
// 
// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// 

"use strict";

const path = require('path');
const utils = require('./utils.js');
const { Table } = require('console-table-printer');

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

		printToConsole: function(title = null, style = null) {
			const actualStyle = this._mergeStyle(style || {});
			const indentString = utils.computeIndentationString(actualStyle.messageIndent);

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
			
			if (actualStyle.spaceBefore) {
				console.log('');
			}

			renderedTableParts.forEach((line) => {
				console.log(indentString + line);
			});

			if (actualStyle.spaceAfter) {
				console.log('');
			}
		},

		_mergeStyle: function(style) {
			return Object.assign(this._getDefaultStyle(), style);
		},

		_getDefaultStyle: function() {
			return {
				messageIndent: 0,
				spaceBefore: true,
				spaceAfter: true
			}
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