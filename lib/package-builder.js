"use strict";

const path = require('path');
const packageModel = require('./package-model.js');

const PackageBuilderLogger = require('./package-builder-logger.js');
const ComponentTemplateReader = require('./template-reader.js');
const PackageBuildContext = require('./package-build-context.js');

const ConsoleReadPackageModelStep = require('./build-steps/console-read.js');
const CreateComponentPackageStep = require('./build-steps/create-component-package.js');
const InstallComponentDepsStep = require('./build-steps/install-component-deps.js');

const BuildStatus = require('./build-status.js');
const JsonManifestReadPackageModelStep = require('./build-steps/json-manifest-read.js');

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

		this._context.packageModelData = 
			packageModel.createEmptyPackageModelData();
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
		return new ComponentTemplateReader(this._context.baseSourceDirectory, 
			this._logger);
	}

	_createPackage(onReady) {
		this._createBuildSteps();
		this._executeBuildSteps(onReady);
	}

	_createBuildSteps() {
		this._steps = [];
		if (this._context.shouldReadPackageModelFromManifest()) {
			this._steps.push(
				new JsonManifestReadPackageModelStep(this._context, 
					this._logger)
			);
		} else {
			this._steps.push(
				new ConsoleReadPackageModelStep(this._context, 
					this._logger)
			);
		}

		this._steps.push(
			new CreateComponentPackageStep(this._context, 
				this._logger)
		);

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