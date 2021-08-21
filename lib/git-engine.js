const fs = require('fs');
const simpleGit = require('simple-git');
const { SimpleGit } = require('simple-git');
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

	commit(message, onReady) {
		this._git.commit(message, (err, commitResult) => {
			let status = BuildStatus.Failed;
			
			if (!err) {
				status = BuildStatus.Successful;
				if (commitResult) {
					this._logger.debug(commitResult);
				}
			} else {
				this._logger.error('Error performing git commit.', err);
			}

			onReady(status);
		});
	}

	pull(onReady) {
		this._git.pull((err, pullResult) => {
			let status = BuildStatus.Failed;

			if (!err) {
				status = BuildStatus.Successful;
				if (pullResult) {
					this._logger.debug(pullResult);
				}
			} else {
				this._logger.error('Error performing git pull.', err);
			}

			onReady(status);
		});
	}

	push(onReady) {
		this._git.push((err, pushResult) => {
			let status = BuildStatus.Failed;

			if (!err) {
				status = BuildStatus.Successful;
				if (pushResult) {
					this._logger.debug(pushResult);
				}
			} else {
				this._logger.error('Error performing git push.', err);
			}

			onReady(status);
		});
	}
}

module.exports = GitEngine;