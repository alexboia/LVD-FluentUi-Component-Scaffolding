"use strict";

const path = require('path');
const fs = require('fs');

const packageModel = require('../package-model.js');

const PackageBuilderLogger = require("../package-builder-logger.js");
const PackageModelValidator = require('../package-model-validator.js');

const BuildStatus = require('../build-status.js');
const PackageBuildContext = require('../package-build-context.js');

class ComponentPackageModelJsonManifestReader {
	constructor(context, logger) {
		this._checkOptionsValidOrThrow(context);
		this._checkLoggerValidOrThrow(logger);

		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type PackageBuildContext */
		this._context = context;

		this._manifestPath = this._determineManifestPath();
		this._data = this._createEmptyPackageModelData();
		/** @type PackageModelValidator */
		this._validator = this._createPackageModelValidator(logger);
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

	_createPackageModelValidator(logger) {
		return new PackageModelValidator(logger);
	}

	_createEmptyPackageModelData() {
		return packageModel.createEmptyPackageModelData();
	}

	_determineManifestPath() {
		return path.join(this._getBaseDestinationPath(), 'component-manifest.json');
	}

	_getBaseDestinationpath() {
		return this._context.getBaseDestinationPath();
	}

	read(onReady) {
		try {
			this._doRead(onReady);
		} catch (e) {
			this._logger.error('Error attempting to read package model data from component manifest file', e);
			onReady(BuildStatus.Failed);
		}	
	}

	_doRead(onReady) {
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
			this._logger.reportProgressError(`Manifest file not found in base destination directory ${this._getBaseDestinationpath()}`)
			onReady(BuildStatus.Failed, null);
		}
	}

	_resetData() {
		this._data = packageModel.createPackageModelDataFromContext(this._context);
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