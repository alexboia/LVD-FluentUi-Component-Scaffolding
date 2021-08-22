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
const packageModel = require('./package-model.js');

const PackageBuilderLogger = require('./package-builder-logger.js');
const ComponentTemplateReader = require('./template-reader.js');
const PackageBuildContext = require('./package-build-context.js');
const PackageBuildStepProvider = require('./package-build-step-provider.js');
const GitEngine = require('./git-engine.js');

const BuildStatus = require('./build-status.js');
const { ConsoleFormatting } = require('./constants/console-constants.js');

class ComponentPackageBuilder {
	constructor(baseSourceDirectory, baseDestinationPath, options, logger) {
		this._checkBaseSourceDirectoryValidOrThrow(baseSourceDirectory);
		this._checkDestinationPathValidOrThrow(baseDestinationPath);
		this._checkOptionsValidOrThrow(options);
		this._checkLoggerValidOrThrow(logger);

		this._initContext(baseSourceDirectory,
			baseDestinationPath, 
			options);

		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type GitEngine */
		this._gitEngine = null
		this._steps = [];
	};

	_checkBaseSourceDirectoryValidOrThrow(baseSourceDirectory) {
		if (!baseSourceDirectory) {
			throw new Error('Base source directory path is required, but not provided');
		}
	}

	_checkDestinationPathValidOrThrow(baseDestinationPath) {
		if (!baseDestinationPath) {
			throw new Error('Destination path is required, but not provided.');
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

	_initContext(baseSourceDirectory, baseDestinationPath, options) {
		this._context = new PackageBuildContext(baseSourceDirectory, 
			baseDestinationPath, 
			options);

		this._context.setPackageModelData(packageModel.createEmptyPackageModelData());
		this._context.setTemplatePlacholders(this._createTemplatePlaceholders());
		this._context.setTemplate(null);
	}

	_createTemplatePlaceholders() {
		return {
			libraryName: '${LibraryName}',
			libraryNameDashed: '${LibraryNameDashed}',
			packageName: '${PackageName}',
			packageNameLower: '${PackageNameLower}',
			packageDescription: '${PackageDescription}',
			packageAuthor: '${PackageAuthor}',
			currentYear: '${CurrentYear}',
			logDirectoryName: '${LogDirectoryName}'
		};
	}

	create(onReady) {
		this._readTemplate();
		this._createPackage(onReady);
	}

	_readTemplate() {
		const templateReader = this._createTemplateReader();
		const template = templateReader.read();
		this._context.setTemplate(template);
	}

	_createTemplateReader() {
		return new ComponentTemplateReader(this._context.getBaseSourceDirectory(), 
			this._logger);
	}

	_createPackage(onReady) {
		this._createBuildSteps();
		this._executeBuildSteps(onReady);
	}

	_createBuildSteps() {
		const buildStepsProvider = this._createBuildStepsProvider();
		this._steps = buildStepsProvider.createSteps();
	}

	_createBuildStepsProvider() {
		return new PackageBuildStepProvider(this._context, 
			this._logger);
	}

	_executeBuildSteps(onReady) {
		this._executeBuildStep(0, onReady);
	}

	_executeBuildStep(stepIndex, onReady) {
		const buildStepFactory = this._steps[stepIndex];
		const buildStep = buildStepFactory(this._context, this._logger);
		
		if (!!buildStep.name) {
			this._logger.reportNormalProgressStep(`Executing build step: ${buildStep.name}...`);
		}

		buildStep.execute((buildStatus) => {
			this._reportBuildStepExecutionStatus(buildStatus);
			this._handleBuildStepExecuted(stepIndex, 
				buildStatus, 
				onReady);
		});
	}

	_reportBuildStepExecutionStatus(buildStatus) {
		const buildStepCompletionMessage = this._formatStepResultDescription(`Build step completed with status: ${buildStatus}`);
		if (buildStatus == BuildStatus.Successful) {
			this._logger.reportNormalProgressStep(buildStepCompletionMessage);
		} else if (buildStatus == BuildStatus.AbortedByUser) {
			this._logger.reportProgressWarning(buildStepCompletionMessage);
		} else {
			this._logger.reportProgressError(buildStepCompletionMessage);
		}
	}

	_formatStepResultDescription(text) {
		return '\t'.repeat(ConsoleFormatting.DefaultIndent) + text;
	}

	_handleBuildStepExecuted(stepIndex, buildStatus, onReady) {
		let completed = false;

		if (stepIndex < this._steps.length - 1) {
			if (buildStatus == BuildStatus.Successful) {
				this._executeBuildStep(stepIndex + 1, onReady);
			} else {
				completed = true;
			}
		} else {
			completed = true;
		}

		if (completed) {
			onReady(buildStatus);
		}
	}
}

module.exports = ComponentPackageBuilder;