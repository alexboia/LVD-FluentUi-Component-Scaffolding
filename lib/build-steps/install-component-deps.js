"use strict";

const { exec } = require("child_process");

const PackageBuilderLogger = require("../package-builder-logger");
const PackageBuildContext = require("../package-build-context");
const BuildStatus = require('../build-status.js');

class InstallComponentDepsStep {
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
		this._installPackageDependencies(this._context.getActualDestinationPath(), (succes) => {
			const buildStatus = succes 
				? BuildStatus.Successful 
				: BuildStatus.Failed;

			onReady(buildStatus);
		});
	}

	_installPackageDependencies(destinationPath, onReady) {
		const returnToDir = process.cwd();
	
		this._logger.debug('Attempting to install package dependencies...');
		process.chdir(destinationPath);

		exec('npm install', {
			encoding: 'utf8',
			windowsHide: true
		}, (error, stdout, stderr) => {
			let success = false;

			if (error) {
				this._logger.error(error.message);
			} else if (stderr) {
				this._logger.warning(stderr);
				success = true;
			} else {
				success = true;
			}

			if (!!stdout) {
				this._logger.debug(stdout);
			}

			if (!success) {
				this._logger.reportProgressWarning('There was an issue while installing dependencies. Please consult the logs for more details.');
			} else {
				this._logger.debug('Successfully installed package dependencies.');
			}

			process.chdir(returnToDir);
			onReady(success);
		});
	}

	get name() {
		return 'Install component dependencies';
	}
}

module.exports = InstallComponentDepsStep;