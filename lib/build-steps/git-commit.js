"use strict";

const GitEngine = require("../git-engine");
const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

const StepName = 'Git commit after package creation';
const DefaultGitCommitMessage = 'Draw first blood';

class GitCommitStep {
	constructor(context, logger) {
		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type GitEngine */
		this._gitEngine = this._context.getGitEngine();
	}

	execute(onReady) {
		this._gitEngine.commit(DefaultGitCommitMessage, (status) => {
			onReady(status);
		});
	}

	get name() {
		return StepName;
	}
}

module.exports = GitCommitStep;