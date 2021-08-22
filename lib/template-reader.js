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

class ComponentTemplateReader {
	constructor(baseSourcePath, logger) {
		this._checkSourceDirectoryValidOrThrow(baseSourcePath);
		this._checkLoggerValidOrThrow(logger);
		
		this._sourcePath = path.normalize(baseSourcePath);
		this._logger = logger;
	}

	_checkSourceDirectoryValidOrThrow(baseSourcePath) {
		if (!baseSourcePath) {
			throw new Error('Source directory is required, but not provided.');
		}

		if (!fs.existsSync(baseSourcePath)) {
			throw new Error(`Source directory ${baseSourcePath} does not exist.`);
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	read() {
		const templateLocation = this._determineTemplateLocation();
		this._checkTemplateLocationExistsOrThrow(templateLocation);

		this._logger.debug(`Reading template from ${templateLocation}...`);
		const template = this._getTemplateContentsRecursively(templateLocation);

		this._logger.debug(`Done reading template. Found ${template.length} top level entries.`);
		return template;
	}

	_checkTemplateLocationExistsOrThrow(templateLocation) {
		if (!fs.existsSync(templateLocation)) {
			throw new Error(`No template directory found in source directory ${this._sourcePath}.`);
		}
	}

	_determineTemplateLocation() {
		return path.normalize(path.join(this._sourcePath, 'template'));
	}

	_getTemplateContentsRecursively(directoryPath) {
		const result = [];
		const files = fs.readdirSync(directoryPath);
		
		files.forEach((fileName) => {
			const filePath = path.join(directoryPath, fileName);
			const isDirectory = this._isDirectory(filePath);
	
			const resultItem = {
				fileName: fileName,
				isDirectory: isDirectory,
				contents: !isDirectory 
					? this._readFileContents(filePath)
					: null,
				items: isDirectory 
					? this._getTemplateContentsRecursively(filePath) 
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

module.exports = ComponentTemplateReader;