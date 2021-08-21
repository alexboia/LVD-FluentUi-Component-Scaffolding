const GitEngine = require("../git-engine");
const PackageBuildContext = require("../package-build-context");
const PackageBuilderLogger = require("../package-builder-logger");

const StepName = 'Git push after package creation';

class GitPushStep {
	constructor(context, logger) {
		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
		/** @type GitEngine */
		this._gitEngine = this._context.getGitEngine();
	}

	execute(onReady) {
		this._gitEngine.push((status) => {
			onReady(status);
		});
	}

	get name() {
		return StepName;
	}
}

module.exports = GitPushStep;