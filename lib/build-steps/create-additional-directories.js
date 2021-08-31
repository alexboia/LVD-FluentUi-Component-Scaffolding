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

const path = require('path');
const utils = require('../utils.js');

const PackageBuildContext = require('../package-build-context.js');
const PackageBuilderLogger = require('../package-builder-logger.js');

const BuildStatus = require('../build-status.js');
const { ConsoleFormatting } = require('../constants/console-constants.js');
const StepName = 'Create additional directories';

class CreateAdditionalDirectoriesStep {
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
			const directories = this._getAdditionalDirectoriesToCreate();
			directories.forEach((directoryName) => {
				this._createDirectory(directoryName)
			});
		} catch (e) {
			this._logger.error('Failed to create additional directories.');
			buildStatus = BuildStatus.Failed;
		}

		onReady(buildStatus);
	}

	_getAdditionalDirectoriesToCreate() {
		return this._context.getAdditionalDirectories();
	}

	_createDirectory(directoryName) {
		this._logger.reportNormalProgressStep(this._formatMessage(`Creating additional directory ${directoryName}...`));
		try {
			const directoryPath = this._determineDirectoryPath(directoryName);
			utils.ensureDirectoryExists(directoryPath);
			this._logger.reportNormalProgressStep(this._formatMessage('Done creating directory'));
		} catch (e) {
			this._logger.reportProgressError(this._formatMessage(`Failed to create additional directory ${directoryName}`), e);
		}
	}

	_formatMessage(message) {
		return utils.formatMessage(message, {
			messageIndent: ConsoleFormatting.DefaultIndent
		});
	}

	_determineDirectoryPath(directoryName) {
		const basePath = path.dirname(this._context.getActualDestinationPath());
		return path.join(basePath, directoryName);
	}

	get name() {
		return StepName;
	}
}

module.exports = CreateAdditionalDirectoriesStep;