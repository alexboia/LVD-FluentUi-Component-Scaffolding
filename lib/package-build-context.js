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

	get baseSourceDirectory() {
		return this._baseSourceDirectory;
	}

	get baseDestinationPath() {
		return this._baseDestinationPath;
	}

	set actualDestinationPath(value) {
		this._actualDestinationPath = value;
	}

	get actualDestinationPath() {
		return this._actualDestinationPath;
	}

	get options() {
		return this._options;
	}
	
	set template(value) {
		this._template = value;
	}

	get template() {
		return this._template;
	}

	get hasTemplate() {
		return this.template != null;
	}

	set templatePlacholders(value) {
		this._templatePlacholders = value;
	}

	get templatePlacholders() {
		return this._templatePlacholders;
	}

	set packageModelData(value) {
		this._packageModelData = value;
	}

	get packageModelData() {
		return this._packageModelData;
	}

	get hasPackageModelData() {
		const packageModelData = this.packageModelData;
		return !!packageModelData && !!packageModelData.packageName;
	}
}

module.exports = PackageBuildContext;