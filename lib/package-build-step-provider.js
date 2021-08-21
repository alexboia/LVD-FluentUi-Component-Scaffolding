const GitEngine = require("./git-engine");
const PackageBuildContext = require("./package-build-context");
const PackageBuilderLogger = require("./package-builder-logger");

const CallbackStep = require("./build-steps/callback");
const ConsoleReadPackageModelStep = require("./build-steps/console-read");
const CreateComponentPackageStep = require("./build-steps/create-component-package");
const GitCloneStep = require("./build-steps/git-clone");
const InstallComponentDepsStep = require("./build-steps/install-component-deps");
const JsonManifestReadPackageModelStep = require("./build-steps/json-manifest-read");
const GitCommitStep = require("./build-steps/git-commit");
const GitPushStep = require("./build-steps/git-push");

const BuildStatus = require('./build-status');

const SetActualDestinationPathStepName = 'Determine actual destination path';
const InitializeGitEngineStepName = 'Initialize git engine';

class PackageBuildStepProvider {
	constructor(context, logger) {
		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
	}

	createSteps() {
		const steps = [];

		steps.push(this._createTemplateReadStep());
		steps.push(this._createSetActualDestinationPathStep());

		if (this._needsGitEngine()) {
			steps.push(this._createInitializeGitEngineStep());
		}

		if (this._shouldGitClone()) {
			steps.push(this._createGitCloneStep());
		}

		steps.push(this._createCreateComponentPackageStep());

		if (this._shouldGitCommit() || this._shouldGitPush()) {
			steps.push(this._createGitCommitStep());
		}

		if (this._shouldGitPush()) {
			steps.push(this._createGitPushStep());
		}

		if (!this._skipInstallingDependencies()) {
			steps.push(this._createInstallComponentDepsStep());
		}

		return steps;
	}

	_createTemplateReadStep() {
		if (this._shouldReadPackageModelFromManifest()) {
			return () => new JsonManifestReadPackageModelStep(this._context, this._logger);
		} else {
			return () => new ConsoleReadPackageModelStep(this._context, this._logger);
		}
	}

	_shouldReadPackageModelFromManifest() {
		return this._context.shouldReadPackageModelFromManifest();
	}

	_createSetActualDestinationPathStep() {
		return () => new CallbackStep(
			() => this._executeSetActualDestinationPathStep(), 
			SetActualDestinationPathStepName, 
			this._context, 
			this._logger
		);
	}

	_executeSetActualDestinationPathStep() {
		this._context.setActualDestinationPath(this._determineActualDestinationPath());
		return BuildStatus.Successful;
	}

	_determineActualDestinationPath() {
		const packageModelData = this._context.getPackageModelData();
		const baseDestinationPath = this._context.getBaseDestinationPath();
		
		const actualDestinationPath = this._context.shouldCreateRoot() 
			? path.join(baseDestinationPath, packageModelData.packageNameLower)
			: baseDestinationPath;

		return actualDestinationPath;
	}

	_needsGitEngine() {
		return this._context.shouldGitClone()
			|| this._context.shouldGitCommit()
			|| this._context.shouldGitPush();
	}

	_createInitializeGitEngineStep() {
		return () => new CallbackStep(
			() => this._executeInitializeGitEngineStep(), 
			InitializeGitEngineStepName, 
			this._context, 
			this._logger
		);
	}

	_executeInitializeGitEngineStep() {
		this._context.setGitEngine(this._createGitEngine());
		return BuildStatus.Successful;
	}

	_createGitEngine() {
		const gitConfig = {
			name: this._context.getGitName(),
			email: this._context.getGitEmail(),
			username: this._context.getGitUsername(),
			token: this._context.getGitToken()
		};

		const gitEngine = new GitEngine(
			this._context.getActualDestinationPath(), 
			gitConfig,
			this._logger
		);

		return gitEngine;
	}

	_shouldGitClone() {
		return this._context.shouldGitClone();
	}

	_createGitCloneStep() {
		return () => new GitCloneStep(
			this._context, 
			this._logger
		);
	}

	_shouldGitCommit() {
		return this._context.shouldGitCommit();
	}

	_createGitCommitStep() {
		return () => new GitCommitStep(this._context, this._logger);
	}

	_shouldGitPush() {
		return this._context.shouldGitPush();
	}

	_createGitPushStep() {
		return () => new GitPushStep(this._context, this._logger);
	}

	_createCreateComponentPackageStep() {
		return () => new CreateComponentPackageStep(this._context, this._logger);
	}

	_skipInstallingDependencies() {
		return this._context.skipInstallingDependencies();
	}

	_createInstallComponentDepsStep() {
		return () => new InstallComponentDepsStep(this._context, this._logger);
	}
}

module.exports = PackageBuildStepProvider;