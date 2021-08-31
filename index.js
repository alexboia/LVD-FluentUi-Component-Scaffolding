#!/usr/bin/env node
"use strict";

const yargs = require('yargs');
const os = require('os');
const path = require('path');
const utils = require('./lib/utils.js');

const PackageBuilderLogger = require('./lib/package-builder-logger.js');
const ComponentPackageBuilder = require('./lib/package-builder.js');

const LoggingServiceName = 'create-fluentui-component';
const DefaultPackageBuilderLogsDirName = 'package_builder_logs';
const DefaultWorkspaceDirName = 'workspace';

const SharedStorageDirName = 'lvd-fluentui-component-scaffolding';
const DefaultPackageDestinationBaseDirPath = './';

function run() {
	const args = _getArgs();
	const options = _getOptions(args);
	const preliminaryDirs = _initializePreliminaryDirectoryStructure(options);
	const logger = _createLogger(preliminaryDirs.logDirPath);

	try {
		_buildPackage(logger, options);
	} catch (e) {
		logger.reportProgressError('The package could not be created.', e);
	}
}

function _getArgs() {
	return yargs
		.option('from-manifest', {
			alias: 'fm',
			type: 'boolean',
			description: 'Read package information from a manifest file named component-manifest.json in the base destination directory.',
			default: false
		})
		.option('create-root', {
			alias: 'cr',
			type: 'boolean',
			description: 'Create root component directory. Defaults to false, that is use current working directory.',
			default: false
		})
		.option('skip-deps', {
			alias: 'sd',
			type: 'boolean',
			description: 'Do not run npm install afer the component package has been created.',
			default: false
		})
		.option('skip-vscode', {
			alias: 'svs',
			type: 'boolean',
			description: 'Do not create the .code-workspace VS Code workspace file, even if it is included in the template.',
			default: false
		})
		.option('git-clone-repo', {
			alias: 'gcr',
			type: 'string',
			description: 'Clone the specified directory before creating the component package. Will fail if directory is not empty.',
			default: null
		})
		.option('git-commit', {
			alias: 'gcm',
			type: 'boolean',
			description: 'Perform a git commit after creating the component package. You will be prompted for an optional commit message.',
			default: false
		})
		.option('git-push', {
			alias: 'gcp',
			type: 'boolean',
			description: 'Perform a git commit and push after creating the component package. If this flag is specified, the git-commit flag is not required.',
			default: false
		})
		.option('git-name', {
			alias: 'gnm',
			type: 'string',
			description: 'Configure git operations to use this author name.',
			default: null
		})
		.option('git-email', {
			alias: 'gem',
			type: 'string',
			description: 'Configure git operations to use this author email.',
			default: null
		})
		.option('git-username', {
			alias: 'gur',
			type: 'string',
			description: 'Configure git operations to use this username when logging on.',
			default: null
		})
		.option('git-token', {
			alias: 'gtk',
			type: 'string',
			description: 'Configure git operations to use this token as password when logging on.',
			default: null
		})
		.option('log-directory', {
			alias: 'ld',
			type: 'string',
			description: `Specify log directory name. Defaults to ${DefaultPackageBuilderLogsDirName}`,
			default: DefaultPackageBuilderLogsDirName
		})
		.option('workspace-directory', {
			alias: 'wdir',
			type: 'string',
			description: `Specify workspace directory name. Defaults to ${DefaultWorkspaceDirName}.`,
			default: DefaultWorkspaceDirName
		})
		.option('additional-dirs', {
			alias: 'adirs',
			type: 'array',
			description: 'Specify additional directories to be created alongside the workspace.',
			default: []
		})
		.help()
		.argv;
}

function _getOptions(args) {
	const options = {
		logDirectory: args.logDirectory,
		workspaceDirectory: args.workspaceDirectory,
		additionalDirectories: args.additionalDirs || [],
		shouldCreateRoot: args.createRoot,
		skipCreateVsCodeWorkspaceFile: args.skipVscode,
		gitCloneRepo: args.gitCloneRepo,
		shouldGitCommit: args.gitCommit || args.gitPush,
		shouldGitPush: args.gitPush,
		gitEmail: args.gitEmail,
		gitName: args.gitName,
		gitUsername: args.gitUsername,
		gitToken: args.gitToken,
		skipInstallingDependencies: args.skipDeps,
		shouldReadPackageModelFromManifest: args.fromManifest
	};

	return options;
}

function _initializePreliminaryDirectoryStructure(options) {
	const homeDir = os.homedir();
	const sharedStorageDirPath = path.join(homeDir, SharedStorageDirName);
	utils.ensureDirectoryExists(sharedStorageDirPath);

	const logDirPath = path.join(sharedStorageDirPath, options.logDirectory);
	utils.ensureDirectoryExists(logDirPath);

	return {
		sharedStorageDirPath: sharedStorageDirPath,
		logDirPath: logDirPath
	};
}

function _createLogger(logDirectory) {
	return new PackageBuilderLogger(
		logDirectory, 
		LoggingServiceName
	);
}

function _buildPackage(logger, options) {
	const componentPackageBuilder = _createPackageBuilder(logger, options);
	logger.reportNormalProgressStep('Begin package creation...');

	componentPackageBuilder.create((success) => {
		if (success) {
			logger.reportNormalProgressStep('Completed package creation.');
		} else {
			logger.reportProgressError('The package could not be created.');
		}
	});
}

function _createPackageBuilder(logger, options) {
	const templateSourceDir = __dirname;
	const packageDestinationRootDir = DefaultPackageDestinationBaseDirPath;

	return new ComponentPackageBuilder(templateSourceDir,
		packageDestinationRootDir, 
		options,
		logger);
}

run();