const fs = require('fs');
const simpleGit = require('simple-git');
const { SimpleGit } = require('simple-git');

const PackageBuilderLogger = require('./package-builder-logger.js');
const BuildStatus = require('./build-status.js');

class GitEngine {
	constructor(repositoryFolderPath, gitConfig, logger) {
		this._checkRepositoryFolderPathValidOrThrow(repositoryFolderPath);
		this._checkLoggerValidOrThrow(logger);

		this._repositoryFolderPath = repositoryFolderPath;
		this._setConfig(gitConfig);

		/** @type SimpleGit */
		this._git = this._createAndSetup();
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

	_setConfig(config) {
		this._config = Object.assign(this._emptyConfig(), config);
	}

	_emptyConfig() {
		return {
			name: null,
			email: null,
			username: null,
			token: null
		}
	}

	_createAndSetup() {
		const git = simpleGit(this._repositoryFolderPath, {
			config: []
		});	

		if (this._config.name) {
			git.addConfig('user.name', 
				this._config.name);
		}

		if (this._config.email) {
			git.addConfig('user.email', 
				this._config.email);
		}

		return git;
	}

	clone(repositoryUrl, onReady) {
		const cloneUrl = this._addCredentialsToUrl(repositoryUrl);
		this._git.clone(cloneUrl, this._repositoryFolderPath, (err, cloneResult) => {
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

	_addCredentialsToUrl(repositoryUrl) {
		return repositoryUrl.indexOf('@') < 0 
				&& !!this._config.username 
				&& !!this._config.token
			? repositoryUrl.replace('://', `://${this._config.username}:${this._config.token}@`)
			: repositoryUrl;
	}

	commit(commitMessage, onReady) {
		const author = this._getFormattedAuthor();
		const commitOptions = !!author 
			? { '--author' : author } 
			: null;

		this._git.add('./*', (errAdd, addResult) => {

			this._git.commit(commitMessage, commitOptions, (commitErr, commitResult) => {
				let status = BuildStatus.Failed;
	
				if (!commitErr) {
					status = BuildStatus.Successful;
					if (commitResult) {
						this._logger.debug(commitResult);
					}
				} else {
					this._logger.error('Error performing git commit.', commitErr);
				}
	
				onReady(status);
			});
		});
	}

	_getFormattedAuthor() {
		const authorName = this._config.name;
		const authorEmail = this._config.email;

		if (!!authorEmail && !!authorName) {
			return `${authorName} <${authorEmail}>`;
		} else {
			return authorEmail || authorName;
		}
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