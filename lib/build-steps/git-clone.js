const GitEngine = require("../git-engine");
const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

class GitCloneStep {
	constructor(gitEngine, context, logger) {
		/** @type GitEngine */
		this._gitEngine = gitEngine;
		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
	}

	execute(onReady) {
		const repositoryUrl = this._context.getGitCloneRepo();
		this._gitEngine.clone(repositoryUrl, (status) => {
			onReady(status);
		});
	}

	get name() {
		return 'Git clone repository before package creation';
	}
}

module.exports = GitCloneStep;