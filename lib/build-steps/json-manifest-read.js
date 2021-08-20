const PackageBuildContext = require('../package-build-context.js');
const PackageBuilderLogger = require('../package-builder-logger.js');
const ComponentPackageModelJsonManifestReader = require('../package-model-readers/json-manifest.js');

const BuildStatus = require('../build-status.js');

class JsonManifestReadPackageModelStep {
	constructor(context, logger) {
		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
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
		packageModelData.printToConsole('Will use package information:');
	}

	get name() {
		return 'Read package model from component-manifest.json.';
	}
}

module.exports = JsonManifestReadPackageModelStep;