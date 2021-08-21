"use strict";

const GitEngine = require("../git-engine");
const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

const StepName = 'Git clone repository before package creation';

class GitCloneStep {
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
			this._doGitClone(onReady);
		} catch (e) {
			this._logger.debug('Error executing git clone step.', e);
		}
	}

	_doGitClone(onReady) {
		const repositoryUrl = this._getRepositoryUrl();
		this._logger.debug(`Begin executing git clone operation...`);
		this._gitEngine.clone(repositoryUrl, (status) => {
			this._logger.debug(`Git clone operation executed with status ${status}`);
			onReady(status);
		});
	}

	_getRepositoryUrl() {
		return this._context.getGitCloneRepo();
	}

	get name() {
		return StepName;
	}
}

module.exports = GitCloneStep;