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
const readline = require("readline");

const utils = require('../utils.js');
const packageModel = require('../package-model.js');

const PackageBuilderLogger = require("../package-builder-logger.js");
const PackageModelValidator = require('../package-model-validator.js');
const PackageBuildContext = require('../package-build-context.js');

const NoDefaultPackageModelValue = '[none]';
const BuildStatus = require('../build-status.js');

class ComponentPackageModelConsoleReader {
	constructor(config, context, logger) {
		this._checkContextValidOrThrow(context);
		this._checkLoggerValidOrThrow(logger);

		this._data = this._createEmptyPackageModelData();
		this._userInput = this._createInputInterface();
		this._status = BuildStatus.Successful;
		this._config = this._mergeConfig(config || {});

		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type PackageModelValidator */
		this._validator = this._createPackageModelValidator();
	}

	_checkContextValidOrThrow(context) {
		if (!context) {
			throw new Error('Context is required, but not provided');
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	_mergeConfig(config) {
		return Object.assign(this._getDefaultConfig(), config);
	}

	_getDefaultConfig() {
		return {
			messageIndent: 0
		}
	}

	_createEmptyPackageModelData() {
		return packageModel.createEmptyPackageModelData();
	}

	_createPackageModelValidator() {
		return new PackageModelValidator(
			{ messageIndent: this._config.messageIndent }, 
			this._logger
		);
	}

	_createInputInterface() {
		return readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
	}

	read(onReady) {
		try {
			this._doRead(onReady);
		} catch (e) {
			this._logger.error('Error attempting to read package model data from console user input', e);
			onReady(BuildStatus.Failed);
		}
	}

	_doRead(onReady) {
		this._resetStatus();
		this._resetData();
		this._logger.debug('Collecting package information from user input...');

		this._userInput.on('close', () => {
			onReady(this._status, this._data);
		});

		this._userInput.on('SIGINT', () => {
			this._resetData();
			this._setAborderByUserStatus();
			this._newline();
			this._endUserInput();
		});

		this._promptForPackageName((packageName) => {
			this._setPackageName(packageName);

			this._promptForPackageDescription((packageDescription) => {
				this._setPackageDescription(packageDescription);

				this._promptForPackageAuthor((packageAuthor) => {
					this._setPackageAuthor(packageAuthor);

					this._promptForLibraryName((libraryName) => {
						this._setLibraryName(libraryName);

						this._promptForDashedLibraryName((dashedLibraryName) => {
							this._setDashedLibraryName(dashedLibraryName);
							this._endUserInput();
						});
					});
				});
			});
		});
	}

	_newline() {
		console.log('\r');
	}

	_resetStatus() {
		this._status = BuildStatus.Successful;
	}

	_setAborderByUserStatus() {
		this._status = BuildStatus.AbortedByUser;
	}

	_resetData() {
		this._data = packageModel.createPackageModelDataFromContext(this._context);
	}

	_endUserInput() {
		this._userInput.close();
	}

	_promptForPackageName(onReady) {
		const defaultValuePrompt = this._getDefaultPackageNamePrompt();
		this._userInput.question(this._formatMessage(`Package name (default value: ${defaultValuePrompt}) = `), 
			(packageName) => {
				const packageNameOk = this._checkPackageName(packageName);
				if (!packageNameOk) {
					this._handleInputInvalid();
				} else {
					onReady(packageName);
				}
			});
	}

	_handleInputInvalid() {
		this._resetData();
		this._setInputInvalidStatus();
		this._endUserInput();
	}

	_setInputInvalidStatus() {
		this._status = BuildStatus.Failed;
	}

	_formatMessage(message) {
		return utils.formatMessage(message, {
			messageIndent: this._config.messageIndent
		});
	}

	_getDefaultPackageNamePrompt() {
		return this._data.packageName || NoDefaultPackageModelValue;
	}

	_checkPackageName(packageName) {
		return this._validator.checkPackageName(packageName, 
			this._data);
	}

	_setPackageName(packageName) {
		this._data.setPackageName(packageName);
	}

	_promptForPackageDescription(onReady) {
		this._userInput.question(this._formatMessage('Package description = '), 
			(packageDescription) => {
				onReady(packageDescription);
			});
	}

	_setPackageDescription(packageDescription) {
		this._data.setPackageDescription(packageDescription);
	}

	_promptForPackageAuthor(onReady) {
		this._userInput.question(this._formatMessage('Package author = '), 
			(packageAuthor) => {
				onReady(packageAuthor);
			});
	}

	_setPackageAuthor(packageAuthor) {
		this._data.setPackageAuthor(packageAuthor);
	}

	_promptForLibraryName(onReady) {
		const defaultValuePrompt = this._getDefaultLibraryNamePrompt();
		this._userInput.question(this._formatMessage(`Libary name (default value: ${defaultValuePrompt}) = `), 
			(libraryName) => {
				const libraryNameOk = this._checkLibraryName(libraryName);
				if (!libraryNameOk) {
					this._handleInputInvalid();
				} else {
					onReady(libraryName);
				}
			});
	}

	_getDefaultLibraryNamePrompt() {
		return this._data.libraryName || NoDefaultPackageModelValue;
	}

	_checkLibraryName(libraryName) {
		return this._validator.checkLibraryName(libraryName, 
			this._data);
	}

	_setLibraryName(libraryName) {
		this._data.setLibraryName(libraryName);
	}

	_promptForDashedLibraryName(onReady) {
		const defaultValuePrompt = this._getDefaulDashedLibraryNamePrompt();
		this._userInput.question(this._formatMessage(`Library name, dashed form (default value: ${defaultValuePrompt}) = `), 
			(dashedLibraryName) => {
				const dashedLibraryNameOk = this._checkDashedLibraryName(dashedLibraryName);
				if (!dashedLibraryNameOk) {
					this._handleInputInvalid();
				} else {
					onReady(dashedLibraryName);
				}
			});
	}

	_checkDashedLibraryName(dashedLibraryName) {
		return this._validator.checkDashedLibraryName(dashedLibraryName, 
			this._data);
	}

	_getDefaulDashedLibraryNamePrompt() {
		return this._data.libraryNameDashed || NoDefaultPackageModelValue;
	}

	_setDashedLibraryName(dashedLibraryName) {
		this._data.setDashedLibraryName(dashedLibraryName);
	}

	getLastReadData() {
		return this._data;
	}

	isAvailable() {
		return true;
	}
}

module.exports = ComponentPackageModelConsoleReader;