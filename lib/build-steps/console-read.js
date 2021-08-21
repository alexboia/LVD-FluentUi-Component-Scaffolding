"use strict";

const PackageBuildContext = require('../package-build-context.js');
const PackageBuilderLogger = require('../package-builder-logger.js');
const ComponentPackageModelConsoleReader = require('../package-model-readers/console.js');

const BuildStatus = require('../build-status.js');
const StepName = 'Read package model from console user input';

class ConsoleReadPackageModelStep {
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
		this._readPackageModel(onReady);
	}

	_readPackageModel(onReady) {
		/** @type ComponentPackageModelConsoleReader */
		const packageModelReader = this._creatPackageModelReader();
		packageModelReader.read((buildStatus, packageModelData) => {
			this._context.setPackageModelData(packageModelData);
			if (buildStatus == BuildStatus.Successful) {
				this._displayPackageModelData(packageModelData);
			}
			onReady(buildStatus);
		});
	}

	_creatPackageModelReader() {
		return new ComponentPackageModelConsoleReader(this._context,
			this._logger);
	}

	_displayPackageModelData(packageModelData) {
		packageModelData.printToConsole('Will use package information:');
	}

	get name() {
		return StepName;
	}
}

module.exports = ConsoleReadPackageModelStep;