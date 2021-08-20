const PackageBuildContext = require('../package-build-context.js');
const PackageBuilderLogger = require('../package-builder-logger.js');
const ComponentPackageModelConsoleReader = require('../package-model-readers/console.js');

const BuildStatus = require('../build-status.js');

class ConsoleReadPackageModelStep {
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
		return 'Read package model from console user input';
	}
}

module.exports = ConsoleReadPackageModelStep;