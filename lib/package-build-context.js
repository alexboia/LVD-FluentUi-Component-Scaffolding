const path = require('path');

class PackageBuildContext {
	constructor(baseSourceDirectory, baseDestinationPath, options) {
		this._checkBaseSourceDirectoryValidOrThrow(baseSourceDirectory);
		this._checkDestinationPathValidOrThrow(baseDestinationPath);
		this._checkOptionsValidOrThrow(options);

		this._baseSourceDirectory = path.resolve(baseSourceDirectory);
		this._baseDestinationPath = path.resolve(baseDestinationPath);
		this._actualDestinationPath = null;
		this._options = options;

		this._templatePlacholders = null;
		this._packageModelData = null;
		this._template = null;
	}

	_checkBaseSourceDirectoryValidOrThrow(baseSourceDirectory) {
		if (!baseSourceDirectory) {
			throw new Error('Base source directory path is required, but not provided');
		}
	}

	_checkTemplateValidOrThrow(template) {
		if (!template || !template.length) {
			throw new Error('The template is required, but not provided.');
		}
	}

	_checkDestinationPathValidOrThrow(baseDestinationPath) {
		if (!baseDestinationPath) {
			throw new Error('Destination path is required, but not provided.');
		}
	}

	_checkOptionsValidOrThrow(options) {
		if (!options) {
			throw new Error('Options are required, but not provided');
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	getLogDirectory() {
		return this._options.logDirectory;
	}

	shouldCreateRoot() {
		return !!this._options.shouldCreateRoot;
	}

	skipInstallingDependencies() {
		return this._options.skipInstallingDependencies;
	}

	shouldReadPackageModelFromManifest() {
		return this._options.shouldReadPackageModelFromManifest;
	}

	skipCreateVsCodeWorkspaceFile() {
		return this._options.skipCreateVsCodeWorkspaceFile;
	}

	getGitCloneRepo() {
		return this._options.gitCloneRepo;
	}

	shouldGitClone() {
		return !!this.getGitCloneRepo();
	}

	shouldGitCommit() {
		return this._options.shouldGitCommit;
	}

	shouldGitPush() {
		return this._options.shouldGitPush;
	}

	getBaseSourceDirectory() {
		return this._baseSourceDirectory;
	}

	getBaseDestinationPath() {
		return this._baseDestinationPath;
	}

	setActualDestinationPath(value) {
		this._actualDestinationPath = value;
	}

	getActualDestinationPath() {
		return this._actualDestinationPath;
	}

	setTemplate(value) {
		this._template = value;
	}

	getTemplate() {
		return this._template;
	}

	hasTemplate() {
		return this.getTemplate() != null;
	}

	setTemplatePlacholders(value) {
		this._templatePlacholders = value;
	}

	getTemplatePlacholders() {
		return this._templatePlacholders;
	}

	setPackageModelData(value) {
		this._packageModelData = value;
	}

	getPackageModelData() {
		return this._packageModelData;
	}

	hasPackageModelData() {
		const packageModelData = this.getPackageModelData();
		return !!packageModelData 
			&& !!packageModelData.packageName;
	}
}

module.exports = PackageBuildContext;