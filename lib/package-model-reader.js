"use strict";

const readline = require("readline");
const utils = require('./utils.js');
const path = require('path');

const NoDefaultPackageModelValue = '[none]';

class ComponentPackageModelReader {
	constructor(options, logger) {
		this._checkLoggerValidOrThrow(logger);

		this._logger = logger;
		this._data = this._createEmptyPackageModelData();
		this._userInput = this._createInputInterface();
		this._options = options;
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	_createEmptyPackageModelData() {
		return ComponentPackageModelReader.getEmptyData();
	}

	_createInputInterface() {
		return readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
	}

	readFromUserInput(onReady) {
		this._resetData();
		this._logger.debug('Collecting package information from user input...');

		this._userInput.on('close', () => {
			onReady(this._data);
		});

		this._userInput.on('SIGINT', () => {
			this._resetData();
			this._newline();
			this._endUserInput();
		});

		this._trySetDefaultPackageName();
		this._promptForPackageName((packageName) => {
			this._setPackageName(packageName);

			this._promptForPackageDescription((packageDescription) => {
				this._setPackageDescription(packageDescription);

				this._promptForPackageAuthor((packageAuthor) => {
					this._setPackageAuthor(packageAuthor);
					
					this._promptForLibraryName((libraryName) => {
						this._setLibraryName(libraryName);

						this._promptForLibraryNameDashed((libraryNameDashed) => {
							this._setLibraryNameDashed(libraryNameDashed);
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

	_resetData() {
		this._data = Object.assign(this._createEmptyPackageModelData(), {
			logDirectoryName: this._options.logDirectory
		});
	}

	_endUserInput() {
		this._userInput.close();
	}

	_trySetDefaultPackageName() {
		const defaultPackageName = this._tryGuessDefaultPackageName();	
		if (defaultPackageName) {
			this._setPackageName(defaultPackageName);
			this._logger.debug(`Using default package name: ${defaultPackageName}.`);
		} else {
			this._logger.debug('Not using any default package name.');
		}
	}

	_tryGuessDefaultPackageName() {
		let defaultPackageName = null;
		if (!this._options.createRoot) {
			defaultPackageName = path.basename(this._determineCurrentWorkingDirectory());
			if (!this._isPackageNameValid(defaultPackageName)) {
				defaultPackageName = null;
			}
		}
		return defaultPackageName;
	}

	_determineCurrentWorkingDirectory() {
		return process.cwd();
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
		let packageNameOk = false;
		if (!packageName) {
			if (!this._data.packageName) {
				this._logger.reportProgressError('Package name cannot be empty!');
			} else {
				packageNameOk = true;
			}
		} else if (!this._isPackageNameValid(packageName)) {
			this._logger.reportProgressError('Package name can only contain: letters, numbers and dashes!');
		} else {
			packageNameOk = true;
		}
		return packageNameOk;
	}

	_isPackageNameValid(packageName) {
		return !!packageName.match(/^[a-zA-Z0-9\-]+$/g);
	}

	_setPackageName(packageName) {
		if (!!packageName) {
			this._data.packageName = packageName;
			this._data.packageNameLower = packageName.toLowerCase();
			this._setLibraryName(utils.extractDefaultLibraryName(packageName));
		}
	}

	_promptForPackageDescription(onReady) {
		this._userInput.question('Package description = ', 
			(packageDescription) => {
				onReady(packageDescription);
			});
	}

	_setPackageDescription(packageDescription) {
		this._data.packageDescription = packageDescription;
	}

	_promptForPackageAuthor(onReady) {
		this._userInput.question('Package author = ', 
			(packageAuthor) => {
				onReady(packageAuthor);
			});
	}

	_setPackageAuthor(packageAuthor) {
		this._data.packageAuthor = packageAuthor;
	}

	_promptForLibraryName(onReady) {
		const defaultValuePrompt = this._getDefaultLibraryNamePrompt();
		this._userInput.question(`Libary name (default value: ${defaultValuePrompt}) = `, 
			(libraryName) => {
				onReady(libraryName);
			});
	}

	_getDefaultLibraryNamePrompt() {
		return this._data.libraryName || NoDefaultPackageModelValue;
	}

	_setLibraryName(libraryName) {
		if (!!libraryName) {
			this._data.libraryName = libraryName;
			this._data.libraryNameDashed = utils.extractDefaultDashedLibraryName(libraryName);
		}
	}

	_promptForLibraryNameDashed(onReady) {
		const defaultValuePrompt = this._getDefaultLibraryNameDashedPrompt();
		this._userInput.question(`Library name, dashed form (default value: ${defaultValuePrompt}) = `, 
			(libraryNameDashed) => {
				onReady(libraryNameDashed);
			});
	}

	_getDefaultLibraryNameDashedPrompt() {
		return this._data.libraryNameDashed || NoDefaultPackageModelValue;
	}

	_setLibraryNameDashed(libraryNameDashed) {
		if (!!libraryNameDashed) {
			this._data.libraryNameDashed = libraryNameDashed;
		}
	}

	getLastReadData() {
		return this._data;
	}

	static getEmptyData() {
		return {
			libraryName: null,
			libraryNameDashed: null,
			packageName: null,
			packageNameLower: null,
			packageDescription: null,
			packageAuthor: null,
			currentYear: new Date().getFullYear(),
			logDirectoryName: null
		};
	}
}

module.exports = ComponentPackageModelReader;