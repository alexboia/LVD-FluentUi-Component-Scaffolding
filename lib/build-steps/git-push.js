"use strict";

const GitEngine = require("../git-engine");
const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

const StepName = 'Git push after package creation';

class GitPushStep {
	constructor(context, logger) {
		this._checkContextValidOrThrow(context);
		this._checkLoggerValidOrThrow(logger);

		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type GitEngine */
		this._gitEngine = this._context.getGitEngine();
	}

	_checkContextValidOrThrow(context) {
		if (!context) {
			throw new Error('Context is required, but not provided.');
		}

		if (!context.getGitEngine()) {
			throw new Error('Git engine has not been initialized.');
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	execute(onReady) {
		try {
			this._doGitPush(onReady);
		} catch (e) {
			this._logger.error('Error executing git push step', e);
		}
	}

	_doGitPush(onReady) {
		this._logger.debug('Begin executing git push operation...');
		this._gitEngine.push((status) => {
			this._logger.debug(`Git push operation executed with status ${status}`);
			onReady(status);
		});
	}

	get name() {
		return StepName;
	}
}

module.exports = GitPushStep;