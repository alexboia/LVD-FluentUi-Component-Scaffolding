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
const fs = require('fs');

const utils = require('../utils.js');
const packageModel = require('../package-model.js');

const PackageBuilderLogger = require("../package-builder-logger.js");
const PackageModelValidator = require('../package-model-validator.js');

const BuildStatus = require('../build-status.js');
const PackageBuildContext = require('../package-build-context.js');

class ComponentPackageModelJsonManifestReader {
	constructor(config, context, logger) {
		this._checkContextValidOrThrow(context);
		this._checkLoggerValidOrThrow(logger);

		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type PackageBuildContext */
		this._context = context;

		this._manifestPath = this._determineManifestPath();
		this._data = this._createEmptyPackageModelData();
		this._config = this._mergeConfig(config || {});

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

	_createPackageModelValidator() {
		return new PackageModelValidator(
			{ messageIndent: this._config.messageIndent },
			this._logger
		);
	}

	_createEmptyPackageModelData() {
		return packageModel.createEmptyPackageModelData();
	}

	_determineManifestPath() {
		return path.join(this._getBaseDestinationPath(), 'component-manifest.json');
	}

	_getBaseDestinationPath() {
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
			this._reportManifestFileNotFound();
			onReady(BuildStatus.Failed, null);
		}
	}

	_resetData() {
		this._data = packageModel.createPackageModelDataFromContext(this._context);
	}

	_reportManifestFileNotFound() {
		this._logger.reportProgressError(
			this._formatMessage(
				`Manifest file not found in base destination directory ${this._getBaseDestinationPath()}`
			)
		);
	}

	_formatMessage(message) {
		return utils.formatMessage(message, {
			messageIndent: this._config.messageIndent
		});
	}

	_getManifestContents(onReady) {
		return fs.readFile(this._manifestPath, {
			encoding: 'utf8'
		}, (error, data) => {
			let rawReadData = null;
			let readStatus = BuildStatus.Failed;

			if (error) {
				this._reportErrorReadingManifestFile(error);
			} else {
				readStatus = BuildStatus.Successful;
				rawReadData = data;
			}

			onReady(readStatus, rawReadData);
		});
	}

	_reportErrorReadingManifestFile(error) {
		this._logger.reportProgressError(
			this._formatMessage('Error reading manifest file'), 
			error
		);
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
			this._reportErrorParsingManifestFile(e);
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

	_reportErrorParsingManifestFile(error) {
		this._logger.reportProgressError(
			this._formatMessage('Error parsing json manifest file'), 
			error
		);
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