"use strict";

const PackageBuildContext = require('../package-build-context.js');
const PackageBuilderLogger = require('../package-builder-logger.js');
const ComponentPackageModelJsonManifestReader = require('../package-model-readers/json-manifest.js');

const BuildStatus = require('../build-status.js');
const { PackageModelPrintTitle, PackageModelPrintIndent } = require('../constants/package-model-read-constants.js');
const StepName = 'Read package model from component-manifest.json.';

class JsonManifestReadPackageModelStep {
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
		/** @type ComponentPackageModelJsonManifestReader */
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
		return new ComponentPackageModelJsonManifestReader(this._context,
			this._logger);
	}

	_displayPackageModelData(packageModelData) {
		packageModelData.printToConsole(
			PackageModelPrintTitle, 
			PackageModelPrintIndent
		);
	}

	get name() {
		return StepName;
	}
}

module.exports = JsonManifestReadPackageModelStep;