"use strict";

const readline = require("readline");
const utils = require('./utils.js');

class ComponentPackageModelReader {
	constructor(logger) {
		this._checkLoggerValidOrThrow(logger);

		this._logger = logger;
		this._data = this._createEmptyPackageModelData();
		this._userInput = this._createInputInterface();
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
			this._endUserInput();
			this._newline();
		});

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
		console.log('\n');
	}

	_resetData() {
		this._data = this._createEmptyPackageModelData();
	}

	_endUserInput() {
		this._userInput.close();
	}

	_promptForPackageName(onReady) {
		this._userInput.question('Package name = ', (packageName) => {
			let packageNameOk = false;

			if (!packageName) {
				this._logger.reportProgressError('Package name cannot be empty!');
			} else if (!this._isPackageNameValid(packageName)) {
				this._logger.reportProgressError('Package name can only contain: letters, numbers and dashes!');
			} else {
				packageNameOk = true;
			}

			if (!packageNameOk) {
				this._endUserInput();
			} else {
				onReady(packageName);
			}
		});
	}

	_isPackageNameValid(packageName) {
		return !!packageName.match(/^[a-zA-Z0-9\-]+$/g);
	}

	_setPackageName(packageName) {
		this._data.packageName = packageName;
		this._data.packageNameLower = packageName.toLowerCase();
		this._setLibraryName(utils.extractDefaultLibraryName(packageName));
	}

	_promptForPackageDescription(onReady) {
		this._userInput.question('Package description = ', (packageDescription) => {
			onReady(packageDescription);
		});
	}

	_setPackageDescription(packageDescription) {
		this._data.packageDescription = packageDescription;
	}

	_promptForPackageAuthor(onReady) {
		this._userInput.question('Package author = ', (packageAuthor) => {
			onReady(packageAuthor);
		});
	}

	_setPackageAuthor(packageAuthor) {
		this._data.packageAuthor = packageAuthor;
	}

	_promptForLibraryName(onReady) {
		this._userInput.question('Libary name = ', (libraryName) => {
			onReady(libraryName);
		});
	}

	_setLibraryName(libraryName) {
		if (!!libraryName) {
			this._data.libraryName = libraryName;
			this._data.libraryNameDashed = utils.extractDefaultDashedLibraryName(libraryName);
		}
	}

	_promptForLibraryNameDashed(onReady) {
		this._userInput.question('Library name, dashed form = ', (libraryNameDashed) => {
			onReady(libraryNameDashed);
		});
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
			currentYear: new Date().getFullYear()
		};
	}
}

module.exports = ComponentPackageModelReader;