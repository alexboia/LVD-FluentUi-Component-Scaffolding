"use strict";

const path = require('path');
const fs = require('fs');

const packageModel = require('../package-model.js');

const PackageBuilderLogger = require("../package-builder-logger.js");
const PackageModelValidator = require('../package-model-validator.js');

const BuildStatus = require('../build-status.js');

class ComponentPackageModelJsonManifestReader {
	constructor(baseDestinationPath, options, logger) {
		this._checkBaseDestinationPathValidOrThrow(baseDestinationPath);
		this._checkOptionsValidOrThrow(options);
		this._checkLoggerValidOrThrow(logger);

		/** @type PackageBuilderLogger */
		this._logger = logger;
		this._options = options;
		this._baseDestinationPath = baseDestinationPath;

		this._manifestPath = this._determineManifestPath();
		this._data = this._createEmptyPackageModelData();
		/** @type PackageModelValidator */
		this._validator = this._createPackageModelValidator(logger);
	}

	_checkBaseDestinationPathValidOrThrow(baseDestinationPath) {
		if (!baseDestinationPath) {
			throw new Error('Base source directory path is required, but not provided');
		}
	}

	_checkOptionsValidOrThrow(options) {
		if (!options) {
			throw new Error('Options are required, but not provided');
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	_createPackageModelValidator(logger) {
		return new PackageModelValidator(logger);
	}

	_createEmptyPackageModelData() {
		return packageModel.createEmptyPackageModelData();
	}

	_determineManifestPath() {
		return path.join(this._baseDestinationPath, 'component-manifest.json');
	}

	read(onReady) {
		this._resetData();
		if (this.isAvailable()) {
			this._getManifestContents((readStatus, rawReadData) => {
				if (!!rawReadData) {
					const parseStatus = this._processManifest(rawReadData);
					onReady(parseStatus, this._data);
				} else {
					onReady(readStatus, null);
				}
			});
		} else {
			this._logger.reportProgressError(`Manifest file not found in base destination directory ${this._baseDestinationPath}`)
			onReady(BuildStatus.Failed, null);
		}
	}

	_resetData() {
		this._data = Object.assign(this._createEmptyPackageModelData(), {
			logDirectoryName: this._options.logDirectory
		});
	}

	_getManifestContents(onReady) {
		return fs.readFile(this._manifestPath, {
			encoding: 'utf8'
		}, (error, data) => {
			let rawReadData = null;
			let readStatus = BuildStatus.Failed;

			if (error) {
				this._logger.reportProgressError('Error reading manifest file', error);
			} else {
				readStatus = BuildStatus.Successful;
				rawReadData = data;
			}

			onReady(readStatus, rawReadData);
		});
	}

	_processManifest(rawReadData) {
		let inputValid = false;
		let packageData = this._parseManifest(rawReadData);
		
		if (!packageData) {
			return BuildStatus.Failed;
		}

		this._trySetDefaultPackageName();
		if (this._checkPackageName(packageData.packageName)) {
			this._setPackageName(packageData.packageName);
			this._setPackageAuthor(packageData.packageAuthor);
			this._setPackageDescription(packageData.packageDescription);
			
			if (this._checkLibraryName(packageData.libraryName)) {
				this._setLibraryName(packageData.libraryName);

				if (this._checkDashedLibraryName(packageData.dashedLibraryName)) {
					this._setDashedLibraryName(packageData.dashedLibraryName);
					inputValid = true;
				}
			}
		}

		if (!inputValid) {
			this._resetData();
			return BuildStatus.Failed;
		} else {
			return BuildStatus.Successful;
		}
	}

	_parseManifest(rawReadData) {
		let packageData = null;
		try {
			packageData = JSON.parse(rawReadData);
			packageData = this._normanizeManifestData(packageData);
		} catch (e) {
			this._logger.reportProgressError('Error parsing json manifest file', e);
		}
		return packageData;
	}

	_normanizeManifestData(packageData) {
		return Object.assign({
			libraryName: null,
			libraryNameDashed: null,
			packageName: null,
			packageNameLower: null,
			packageDescription: null,
			packageAuthor: null
		}, packageData);
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
		if (!this._options.shouldCreateRoot) {
			defaultPackageName = packageModel.tryGuessDefaultPackageName(this._baseDestinationPath);
		}
		return defaultPackageName;
	}

	_checkPackageName(packageName) {
		return this._validator.checkPackageName(packageName, 
			this._data);
	}

	_setPackageName(packageName) {
		this._data.setPackageName(packageName);
	}

	_setPackageDescription(packageDescription) {
		this._data.setPackageDescription(packageDescription);
	}

	_setPackageAuthor(packageAuthor) {
		this._data.setPackageAuthor(packageAuthor);
	}

	_checkLibraryName(libraryName) {
		return this._validator.checkLibraryName(libraryName, 
			this._data);
	}

	_setLibraryName(libraryName) {
		this._data.setLibraryName(libraryName);
	}

	_checkDashedLibraryName(dashedLibraryName) {
		return this._validator.checkDashedLibraryName(dashedLibraryName, 
			this._data);
	}

	_setDashedLibraryName(dashedLibraryName) {
		this._data.setDashedLibraryName(dashedLibraryName);
	}

	getLastReadData() {
		return this._data;
	}

	isAvailable() {
		return this._manifestExists();
	}

	_manifestExists() {
		return fs.existsSync(this._manifestPath);
	}
}

module.exports = ComponentPackageModelJsonManifestReader;