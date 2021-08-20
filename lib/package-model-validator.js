const packageModel = require('./package-model.js');
const PackageBuilderLogger = require("./package-builder-logger");

class PackageModelValidator {
	constructor(logger) {
		/** @type PackageBuilderLogger */
		this._logger = logger;
	}

	checkPackageName(packageName, packageModelData) {
		let packageNameOk = false;
		if (!packageName) {
			if (!packageModelData.packageName) {
				this._logger.reportProgressError('Package name cannot be empty!');
			} else {
				packageNameOk = true;
			}
		} else if (!this._isPackageNameValid(packageName)) {
			this._logger.reportProgressError('Package name can only contain: letters, numbers and dashes!');
		} else {
			packageNameOk = true;
		}
		return packageNameOk;
	}

	_isPackageNameValid(packageName) {
		return packageModel.isPackageNameValid(packageName);
	}

	checkLibraryName(libraryName, packageModelData) {
		let libraryNameOk = true;
		
		if (!!libraryName) {
			libraryNameOk = this._isLibraryNameValid(libraryName);
			if (!libraryNameOk) {
				this._logger.reportProgressError('Library name can only contain: letters, numbers and underscores!');
			}
		}

		return libraryNameOk;
	}
	
	_isLibraryNameValid(packageName) {
		return packageModel.isLibraryNameValid(packageName);
	}

	checkDashedLibraryName(dashedLibraryName, packageModelData) {
		let dashedLibraryNameOk = true;

		if (!!dashedLibraryName) {
			dashedLibraryNameOk = this._isDashedLibraryNameValid(dashedLibraryName);
			if (!dashedLibraryNameOk) {
				this._logger.reportProgressError('Library name (dashed form) can only contain: letters, numbers and... dashes!');
			}
		}

		return dashedLibraryNameOk;
	}
	
	_isDashedLibraryNameValid(packageName) {
		return packageModel.isDashedLibraryNameValid(packageName);
	}
}

module.exports = PackageModelValidator;