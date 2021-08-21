"use strict";

const GitEngine = require("../git-engine");
const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

const StepName = 'Git commit after package creation';
const DefaultGitCommitMessage = 'Draw first blood';

class GitCommitStep {
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
			this._doGitCommit(onReady);
		} catch (e) {
			this._logger.debug('Error executing git commit step.', e);
		}
	}

	_doGitCommit(onReady) {
		this._logger.debug('Begin executing git commit operation...');
		this._gitEngine.commit(DefaultGitCommitMessage, (status) => {
			this._logger.debug(`Git commit operation executed with status ${status}`);
			onReady(status);
		});
	}

	get name() {
		return StepName;
	}
}

module.exports = GitCommitStep;