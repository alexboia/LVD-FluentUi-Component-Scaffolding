const fs = require('fs');
const simpleGit = require('simple-git');
const { SimpleGit } = require('simple-git');

const PackageBuildContext = require('./package-build-context.js');
const PackageBuilderLogger = require('./package-builder-logger.js');

const BuildStatus = require('./build-status.js');

class GitEngine {
	constructor(repositoryFolderPath, logger) {
		this._checkRepositoryFolderPathValidOrThrow(repositoryFolderPath);
		this._checkLoggerValidOrThrow(logger);

		this._repositoryFolderPath = repositoryFolderPath;

		/** @type SimpleGit */
		this._git = this._createSimpleGit(repositoryFolderPath);
		/** @type PackageBuilderLogger */
		this._logger = logger;
	}

	_checkRepositoryFolderPathValidOrThrow(repositoryFolderPath) {
		if (!repositoryFolderPath) {
			throw new Error('Repository folder path is required, but not provided');
		}

		if (!fs.existsSync(repositoryFolderPath)) {
			throw new Error(`Repository folder path ${repositoryFolderPath} does not exist.`);
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided');
		}
	}

	_createSimpleGit(repositoryFolderPath) {
		return simpleGit(repositoryFolderPath, {
			binary: 'git'
		});	
	}

	clone(repsitoryUrl, onReady) {
		this._git.clone(repsitoryUrl, this._repositoryFolderPath, (err, cloneResult) => {
			let status = BuildStatus.Failed;

			if (!err) {
				status = BuildStatus.Successful;
				if (cloneResult) {
					this._logger.debug(cloneResult);
				}
			} else {
				this._logger.error('Error performing git clone.', err);
			}

			onReady(status);
		});
	}

	commit(message) {
		this._git.commit(message);
	}

	pull() {
		this._git.pull();
	}

	push() {
		this._git.push();
	}
}

module.exports = GitEngine;