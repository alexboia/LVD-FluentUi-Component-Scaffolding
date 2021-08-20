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
	constructor(context, logger) {
		this._checkContextValidOrThrow(context);
		this._checkLoggerValidOrThrow(logger);

		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type PackageModelValidator */
		this._validator = this._createPackageModelValidator(logger);

		this._data = this._createEmptyPackageModelData();
		this._userInput = this._createInputInterface();
		this._status = BuildStatus.Successful;
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

	_createEmptyPackageModelData() {
		return packageModel.createEmptyPackageModelData();
	}

	_createPackageModelValidator(logger) {
		return new PackageModelValidator(logger);
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
		this._userInput.question(`Package name (default value: ${defaultValuePrompt}) = `, 
			(packageName) => {
				const packageNameOk = this._checkPackageName(packageName);
				if (!packageNameOk) {
					this._resetData();
					this._endUserInput();
				} else {
					onReady(packageName);
				}
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
		this._userInput.question('Package description = ', 
			(packageDescription) => {
				onReady(packageDescription);
			});
	}

	_setPackageDescription(packageDescription) {
		this._data.setPackageDescription(packageDescription);
	}

	_promptForPackageAuthor(onReady) {
		this._userInput.question('Package author = ', 
			(packageAuthor) => {
				onReady(packageAuthor);
			});
	}

	_setPackageAuthor(packageAuthor) {
		this._data.setPackageAuthor(packageAuthor);
	}

	_promptForLibraryName(onReady) {
		const defaultValuePrompt = this._getDefaultLibraryNamePrompt();
		this._userInput.question(`Libary name (default value: ${defaultValuePrompt}) = `, 
			(libraryName) => {
				const libraryNameOk = this._checkLibraryName(libraryName);
				if (!libraryNameOk) {
					this._resetData();
					this._endUserInput();
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
		this._userInput.question(`Library name, dashed form (default value: ${defaultValuePrompt}) = `, 
			(dashedLibraryName) => {
				const dashedLibraryNameOk = this._checkDashedLibraryName(dashedLibraryName);
				if (!dashedLibraryNameOk) {
					this._resetData();
					this._endUserInput();
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