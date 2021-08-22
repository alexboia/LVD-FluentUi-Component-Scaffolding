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

const utils = require('./utils.js');
const packageModel = require('./package-model.js');
const PackageBuilderLogger = require("./package-builder-logger.js");

class PackageModelValidator {
	constructor(config, logger) {
		/** @type PackageBuilderLogger */
		this._logger = logger;
		this._config = this._mergeConfig(config);
	}

	_mergeConfig(config) {
		return Object.assign(this._getDefaultConfig(), config);
	}

	_getDefaultConfig() {
		return {
			messageIndent: 0
		};
	}

	checkPackageName(packageName, packageModelData) {
		let packageNameOk = false;
		if (!packageName) {
			if (!packageModelData.packageName) {
				this._logger.reportProgressError(this._formatValidationMessage('Package name cannot be empty!'));
			} else {
				packageNameOk = true;
			}
		} else if (!this._isPackageNameValid(packageName)) {
			this._logger.reportProgressError(this._formatValidationMessage('Package name can only contain: letters, numbers and dashes!'));
		} else {
			packageNameOk = true;
		}
		return packageNameOk;
	}

	_formatValidationMessage(message) {
		return utils.formatMessage(message, {
			messageIndent: this._config.messageIndent
		});
	}

	_isPackageNameValid(packageName) {
		return packageModel.isPackageNameValid(packageName);
	}

	checkLibraryName(libraryName, packageModelData) {
		let libraryNameOk = true;
		
		if (!!libraryName) {
			libraryNameOk = this._isLibraryNameValid(libraryName);
			if (!libraryNameOk) {
				this._logger.reportProgressError(this._formatValidationMessage('Library name can only contain: letters, numbers and underscores!'));
			}
		}

		return libraryNameOk;
	}
	
	_isLibraryNameValid(packageName) {
		return packageModel.isLibraryNameValid(packageName);
	}

	checkDashedLibraryName(dashedLibraryName, packageModelData) {
		let dashedLibraryNameOk = true;

		if (!!dashedLibraryName) {
			dashedLibraryNameOk = this._isDashedLibraryNameValid(dashedLibraryName);
			if (!dashedLibraryNameOk) {
				this._logger.reportProgressError(this._formatValidationMessage('Library name (dashed form) can only contain: letters, numbers and... dashes!'));
			}
		}

		return dashedLibraryNameOk;
	}
	
	_isDashedLibraryNameValid(packageName) {
		return packageModel.isDashedLibraryNameValid(packageName);
	}
}

module.exports = PackageModelValidator;