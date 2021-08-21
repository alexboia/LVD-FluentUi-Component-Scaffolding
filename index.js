#!/usr/bin/env node
"use strict";

const yargs = require('yargs');

const PackageBuilderLogger = require('./lib/package-builder-logger.js');
const ComponentPackageBuilder = require('./lib/package-builder.js');

function run() {
	const args = _getArgs();
	const options = _getOptions(args);
	const logger = _createLogger(options.logDirectory);

	try {
		_buildPackage(logger, options);
	} catch (e) {
		logger.reportProgressError('The package could not be created.', e);
	}
}

function _getArgs() {
	return yargs
		.option('log-directory', {
			alias: 'ld',
			type: 'string',
			description: 'Specify log directory name. Defaults to ./_logs if --create-root is specified or to ../logs if not',
			default: null
		})
		.option('create-root', {
			alias: 'cr',
			type: 'boolean',
			description: 'Create root component directory. Defaults to false, that is use current working directory.',
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
			description: 'Clone the specified directory before creating the component package. Will fail if a .git folder is found and the repository is different than the given one.',
			default: null
		})
		.option('git-commit', {
			alias: 'gcm',
			type: 'boolean',
			description: 'Perform a git commit after creating the component package. You will be prompted for an optional commit message.',
			default: true
		})
		.option('git-push', {
			alias: 'gcp',
			type: 'boolean',
			description: 'Perform a git commit and push after creating the component package. If this flag is specified, the git-committ flag is not required.',
			default: true
		})
		.option('git-name', {
			alias: 'gnm',
			type: 'string',
			description: 'Configure git operations to use this name.',
			default: null
		})
		.option('git-email', {
			alias: 'gem',
			type: 'string',
			description: 'Configure git operations to use this email.',
			default: null
		})
		.option('git-username', {
			alias: 'gur',
			type: 'string',
			description: 'Configure git operations to use this username.',
			default: null
		})
		.option('git-token', {
			alias: 'gtk',
			type: 'string',
			description: 'Configure git operations to use this token.',
			default: null
		})
		.option('skip-deps', {
			alias: 'sd',
			type: 'boolean',
			description: 'Do not run npm install afer the component package has been created.',
			default: false
		})
		.option('from-manifest', {
			alias: 'fm',
			type: 'boolean',
			description: 'Read package information from a manifest file named component-manifest.json in the base destination directory.',
			default: false
		})
		.help()
		.argv;
}

function _getOptions(args) {
	let logDirectory = args.logDirectory;
	if (!logDirectory) {
		logDirectory = args.createRoot
			? './_logs'
			: '../_logs';
	}

	const options = {
		logDirectory: logDirectory,
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

function _createLogger(logDirectory) {
	const serviceName = 'create-fluentui-component';
	return new PackageBuilderLogger(logDirectory, serviceName);
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
	const packageDestinationRootDir = './';

	return new ComponentPackageBuilder(templateSourceDir,
		packageDestinationRootDir, 
		options,
		logger);
}

run();