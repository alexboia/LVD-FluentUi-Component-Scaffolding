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

function computeIndentationString(amount) {
	return amount > 0
		? '\t'.repeat(amount)
		: '';
}

function formatMessage(message, style) {
	return computeIndentationString(style.messageIndent) + message;
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
	normalizeAndEnsureDirectoryExists: normalizeAndEnsureDirectoryExists,
	computeIndentationString: computeIndentationString,
	formatMessage: formatMessage
};