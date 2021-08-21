"use strict";

const GitEngine = require("../git-engine");
const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

const StepName = 'Git clone repository before package creation';

class GitCloneStep {
	constructor(context, logger) {
		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type GitEngine */
		this._gitEngine = this._context.getGitEngine();
	}

	execute(onReady) {
		const repositoryUrl = this._context.getGitCloneRepo();
		this._gitEngine.clone(repositoryUrl, (status) => {
			onReady(status);
		});
	}

	get name() {
		return StepName;
	}
}

module.exports = GitCloneStep;