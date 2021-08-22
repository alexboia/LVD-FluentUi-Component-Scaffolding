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
const utils = require('../utils.js');
const lodash = require('lodash');

const PackageBuilderLogger = require('../package-builder-logger.js');
const PackageBuildContext = require('../package-build-context.js');

const BuildStatus = require('../build-status.js');
const StepName = 'Create component package';

class CreateComponentPackageStep {
	constructor(context, logger) {
		this._checkContextValidOrThrow(context);
		this._checkLoggerValidOrThrow(logger);

		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
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

	execute(onReady) {
		let buildStatus = BuildStatus.Successful;

		try {
			this._createPackage();
		} catch (e) {
			buildStatus = BuildStatus.Failed;
			this._logger.error(e);
		}

		onReady(buildStatus);
	}

	_createPackage() {
		const packageContents = this._createPackageContents();
		const destinationPath = this._context.getActualDestinationPath();

		this._writePackage(packageContents, 
			destinationPath);
	}

	_createPackageContents() {
		this._logger.debug('Building package contents...');
		const packageContents = this._processTemplate(this._context.getTemplate());
		
		this._logger.debug('Done building package contents.');
		return packageContents;
	}

	_processTemplate(template) {
		const packageContents = [];
	
		template.forEach((templateItem) => {
			const packageItem = lodash.cloneDeep(templateItem);
			if (this._shouldIgnorePackageItem(packageItem)) {
				return;
			}
			
			packageItem.fileName = this._processFileName(packageItem.fileName);
			if (packageItem.isDirectory) {
				packageItem.items = this._processTemplate(packageItem.items);
			} else {
				packageItem.contents = this._replacePlaceholders(packageItem.contents);
			}
	
			packageContents.push(packageItem);
		});
	
		return packageContents;
	}

	_shouldIgnorePackageItem(packageItem) {
		let ignore = false;
		if (!utils.isDummyFile(packageItem.fileName)) {
			if (utils.isVsCodeWorkspaceFile(packageItem.fileName)) {
				ignore = this._context.skipCreateVsCodeWorkspaceFile();
			}
		} else {
			ignore = true;
		}
		return ignore;
	}

	_processFileName(fileName) {
		let finalFileName = fileName;
		if (utils.isGitIgnoreSurogateFile(finalFileName)) {
			finalFileName = utils.convertToRegularGitIgnoreFileName(finalFileName);
		} else if (utils.isTemplateFileName(finalFileName)) {
			finalFileName = this._replacePlaceholders(finalFileName);
		}
		return finalFileName;
	}

	_replacePlaceholders(source) {
		let result = source;
		const templatePlacholders = this._context.getTemplatePlacholders();
		const packageModelData = this._context.getPackageModelData();
	
		for (const placeholderKey in templatePlacholders) {
			if (templatePlacholders.hasOwnProperty(placeholderKey)) {
				const placholder = templatePlacholders[placeholderKey];
				const bindValue = packageModelData[placeholderKey];

				result = result.replaceAll(placholder, 
					bindValue);
			}
		}
	
		return result;
	}

	_writePackage(packageContents, destinationPath) {
		this._logger.debug('Writing package contents on disk...');

		this._ensureDestinationPathExists(destinationPath);
		this._writePackageContents(packageContents, destinationPath);
		
		this._logger.debug('Done writing package contents.');
	}

	_ensureDestinationPathExists(destinationPath) {
		this._logger.debug(`Ensuring destination path ${destinationPath} exists...`);
		utils.ensureDirectoryExists(destinationPath);
	}

	_writePackageContents(packageContents, destinationPath) {
		packageContents.forEach((packageItem) => {
			const itemPath = path.join(destinationPath, 
				packageItem.fileName);
	
			this._preparePackageItem(packageItem, 
				itemPath);
	
			this._writePackageItemContents(packageItem, 
				itemPath);
		});
	}
	
	_preparePackageItem(packageItem, itemPath) {
		if (!fs.existsSync(itemPath) && packageItem.isDirectory) {
			fs.mkdirSync(itemPath, {
				recursive: true
			});
		}
	}
	
	_writePackageItemContents(packageItem, itemPath) {
		if (packageItem.isDirectory) {
			this._writePackageContents(packageItem.items, 
				itemPath);
		} else {
			fs.writeFileSync(itemPath, packageItem.contents, {
				encoding: 'utf-8'
			});
		}
	}

	get name() {
		return StepName;
	}
}

module.exports = CreateComponentPackageStep;