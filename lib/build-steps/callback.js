"use strict";

const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

const BuildStatus = require('../build-status.js');

class CallbackStep {
	constructor(callback, name, context, logger) {
		this._callback = callback;
		this._name = name;

		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
	}

	execute(onReady) {
		let buildStatus = BuildStatus.Failed;

		try {
			buildStatus =  this._callback(this._context, this._logger);
			if (buildStatus == undefined || buildStatus == null) {
				buildStatus = BuildStatus.Failed;
			}
		} catch (e) {
			this._logger.error(e);
		}

		onReady(buildStatus);
	}

	get name() {
		return this._name;
	}
}

module.exports = CallbackStep;