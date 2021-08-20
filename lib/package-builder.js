"use strict";

const path = require('path');

const PackageBuilderLogger = require('./package-builder-logger.js');
const ComponentTemplateReader = require('./template-reader.js');
const ComponentPackageModelConsoleReader = require('./package-model-readers/console.js');
const PackageBuildContext = require('./package-build-context.js');

const ConsoleReadPackageModelStep = require('./build-steps/console-read.js');
const CreateComponentPackageStep = require('./build-steps/create-component-package.js');
const InstallComponentDepsStep = require('./build-steps/install-component-deps.js');

const BuildStatus = require('./build-status.js');

class ComponentPackageBuilder {
	constructor(baseTemplateSourcePath, baseDestinationPath, options, logger) {
		this._checkTemplateSourcePathValidOrThrow(baseTemplateSourcePath);
		this._checkDestinationPathValidOrThrow(baseDestinationPath);
		this._checkOptionsValidOrThrow(options);
		this._checkLoggerValidOrThrow(logger);

		this._initContext(baseTemplateSourcePath,
			baseDestinationPath, 
			options);

		/** @type PackageBuilderLogger */
		this._logger = logger;
		this._steps = [];
	};

	_checkTemplateSourcePathValidOrThrow(baseTemplateSourcePath) {
		if (!baseTemplateSourcePath) {
			throw new Error('Template source path is required, but not provided');
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

	_initContext(baseTemplateSourcePath, baseDestinationPath, options) {
		this._context = new PackageBuildContext(baseTemplateSourcePath, 
			baseDestinationPath, 
			options);

		this._context.packageModelData = 
			ComponentPackageModelConsoleReader.getEmptyData();
		this._context.templatePlacholders = 
			this._createTemplatePlaceholders();
		this._context.template = null;
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
		this._context.template = templateReader
			.read();
	}

	_createTemplateReader() {
		return new ComponentTemplateReader(this._context.baseTemplateSourcePath, 
			this._logger);
	}

	_createPackage(onReady) {
		this._createBuildSteps();
		this._executeBuildSteps(onReady);
	}

	_createBuildSteps() {
		this._steps = [
			new ConsoleReadPackageModelStep(this._context, 
				this._logger),
			new CreateComponentPackageStep(this._context, 
				this._logger)
		];

		if (!this._context.skipInstallingDependencies()) {
			this._steps.push(
				new InstallComponentDepsStep(this._context, 
					this._logger)
			);
		}
	}

	_executeBuildSteps(onReady) {
		this._executeBuildStep(0, onReady);
	}

	_executeBuildStep(stepIndex, onReady) {
		const buildStep = this._steps[stepIndex];
		this._logger.reportNormalProgressStep(`Executing build step: ${buildStep.name}...`);
		buildStep.execute((buildStatus) => {
			this._reportBuildStepExecutionStatus(buildStatus);
			this._handleBuildStepExecuted(stepIndex, 
				buildStatus, 
				onReady);
		});
	}

	_reportBuildStepExecutionStatus(buildStatus) {
		const buildStepCompletionMessage = `Build step completed with status: ${buildStatus}`;
		if (buildStatus == BuildStatus.Successful) {
			this._logger.reportNormalProgressStep(buildStepCompletionMessage);
		} else if (buildStatus == BuildStatus.AbortedByUser) {
			this._logger.reportProgressWarning(buildStepCompletionMessage);
		} else {
			this._logger.reportProgressError(buildStepCompletionMessage);
		}
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