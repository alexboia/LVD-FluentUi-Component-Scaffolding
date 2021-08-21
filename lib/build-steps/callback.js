"use strict";

const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

const BuildStatus = require('../build-status.js');

class CallbackStep {
	constructor(callback, name, context, logger) {
		this._checkCallbackValidOrThrow(callback);
		this._checkContextValidOrThrow(context);
		this._checkLoggerValidOrThrow(logger);

		this._callback = callback;
		this._name = name;

		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
	}

	_checkCallbackValidOrThrow(callback) {
		if (!callback) {
			throw new Error('Callback is required, but not provided.');
		}

		if (typeof callback !== 'function') {
			throw new Error('Passed callback is not actually a function.');
		}
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
		let buildStatus = BuildStatus.Failed;

		try {
			this._logger.debug('Will execute callback...');

			buildStatus =  this._callback(this._context, this._logger);
			if (buildStatus == undefined || buildStatus == null) {
				buildStatus = BuildStatus.Failed;
			}
		} catch (e) {
			this._logger.error(e);
		}

		this._logger.debug(`Callback execution returned status ${buildStatus}.`);
		onReady(buildStatus);
	}

	get name() {
		return this._name;
	}
}

module.exports = CallbackStep;